// =============================================================================
// AGROLINK BACKEND LOGISTICS & FLEET CONTROLLER
// Load Board Assignment, Corridor Milestones, GPS Telemetry & Digital POD
// =============================================================================

import { db, type DBDelivery, type DBVehicle } from "./db";

export class LogisticsController {
  /**
   * List deliveries with optional role filter
   */
  static listDeliveries(filters?: { transporterId?: string; status?: string }): DBDelivery[] {
    let list = Array.from(db.deliveries.values());

    if (filters?.transporterId) {
      list = list.filter((d) => d.transporter_id === filters.transporterId);
    }

    if (filters?.status) {
      list = list.filter((d) => d.status === filters.status);
    }

    return list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  }

  /**
   * Accept an available delivery job (Transporters only)
   */
  static acceptDeliveryJob(
    transporterId: string,
    data: {
      deliveryId: string;
      vehicleId?: string;
    },
  ): { success: boolean; data?: DBDelivery; error?: string } {
    const transporter = db.users.get(transporterId);
    if (!transporter || (transporter.role !== "transporter" && transporter.role !== "admin")) {
      return { success: false, error: "Only registered transporters can accept haulage jobs." };
    }

    const delivery = db.deliveries.get(data.deliveryId);
    if (!delivery) {
      return { success: false, error: "Delivery job not found." };
    }

    if (delivery.status !== "Pending") {
      return {
        success: false,
        error: `Job has already been assigned (Status: ${delivery.status}).`,
      };
    }

    delivery.transporter_id = transporterId;
    delivery.vehicle_id = data.vehicleId;
    delivery.status = "Accepted";
    delivery.updated_at = new Date().toISOString();

    // Update associated order status
    const order = db.orders.get(delivery.order_id);
    if (order) {
      order.order_status = "Awaiting Pickup";
      order.updated_at = new Date().toISOString();
      db.orders.set(order.id, order);
    }

    db.deliveries.set(delivery.id, delivery);
    db.logAudit(transporterId, "DELIVERY_JOB_ACCEPTED", "deliveries", delivery.id, {
      orderId: delivery.order_id,
      fee: delivery.delivery_fee,
    });

    return { success: true, data: delivery };
  }

  /**
   * Advance Delivery Milestone (Picked Up -> In Transit -> Delivered)
   */
  static updateMilestone(
    transporterId: string,
    data: {
      deliveryId: string;
      status: "Picked Up" | "In Transit" | "Delivered";
      latitude?: number;
      longitude?: number;
      speedKmh?: number;
      cargoTempCelsius?: number;
    },
  ): { success: boolean; data?: DBDelivery; error?: string } {
    const delivery = db.deliveries.get(data.deliveryId);
    if (!delivery) {
      return { success: false, error: "Delivery not found." };
    }

    if (delivery.transporter_id !== transporterId && transporterId !== "u-admin-1") {
      return {
        success: false,
        error: "Unauthorized. You are not the assigned carrier for this haul.",
      };
    }

    delivery.status = data.status;
    if (data.latitude) delivery.current_latitude = data.latitude;
    if (data.longitude) delivery.current_longitude = data.longitude;
    if (data.speedKmh !== undefined) delivery.current_speed_kmh = data.speedKmh;
    if (data.cargoTempCelsius !== undefined) delivery.cargo_temp_celsius = data.cargoTempCelsius;
    delivery.updated_at = new Date().toISOString();

    // Update Order Status
    const order = db.orders.get(delivery.order_id);
    if (order) {
      if (data.status === "Picked Up") order.order_status = "In Transit";
      else if (data.status === "Delivered") order.order_status = "Delivered";
      order.updated_at = new Date().toISOString();
      db.orders.set(order.id, order);
    }

    db.deliveries.set(delivery.id, delivery);
    db.logAudit(transporterId, "DELIVERY_MILESTONE_UPDATED", "deliveries", delivery.id, {
      status: data.status,
      speedKmh: data.speedKmh,
      cargoTemp: data.cargoTempCelsius,
    });

    return { success: true, data: delivery };
  }

  /**
   * Register a new fleet vehicle
   */
  static registerVehicle(
    transporterId: string,
    data: {
      plateNumber: string;
      vehicleType: "Truck 40T" | "Reefer 30T" | "Flatbed 20T" | "Van 5T" | "Dispatch Bike";
      capacityKg: number;
      isRefrigerated: boolean;
    },
  ): { success: boolean; data?: DBVehicle; error?: string } {
    const cleanPlate = data.plateNumber.trim().toUpperCase();
    const vehicleId = `v-${Date.now()}`;

    const newVehicle: DBVehicle = {
      id: vehicleId,
      transporter_id: transporterId,
      plate_number: cleanPlate,
      vehicle_type: data.vehicleType,
      capacity_kg: Math.round(data.capacityKg),
      is_refrigerated: data.isRefrigerated,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    db.vehicles.set(newVehicle.id, newVehicle);
    db.logAudit(transporterId, "VEHICLE_REGISTERED", "vehicles", vehicleId, {
      plateNumber: cleanPlate,
      type: data.vehicleType,
    });

    return { success: true, data: newVehicle };
  }

  /**
   * List fleet vehicles for transporter
   */
  static listVehicles(transporterId: string): DBVehicle[] {
    return Array.from(db.vehicles.values()).filter(
      (v) => v.transporter_id === transporterId && v.is_active,
    );
  }
}
