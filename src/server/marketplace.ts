// =============================================================================
// AGROLINK BACKEND MARKETPLACE & PRODUCE CONTROLLER
// Real Produce Listing, Inventory Management & Stock Updates
// =============================================================================

import { db, type DBProduce } from "./db";

export class MarketplaceController {
  /**
   * List all available produce
   */
  static listProduce(filters?: {
    category?: string | undefined;
    farmerId?: string | undefined;
    includeUnavailable?: boolean | undefined;
    query?: string | undefined;
  }): DBProduce[] {
    let list = Array.from(db.produce.values());

    if (!filters?.includeUnavailable) {
      list = list.filter((p) => p.is_available && p.available_quantity_kg > 0);
    }

    if (filters?.farmerId) {
      list = list.filter((p) => p.farmer_id === filters.farmerId);
    }

    if (filters?.category && filters.category !== "All") {
      list = list.filter((p) => p.category === filters.category);
    }

    if (filters?.query) {
      const q = filters.query.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.location_name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }

    return list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  }

  /**
   * Create a new produce listing (Farmer only)
   */
  static createProduce(
    farmerId: string,
    data: {
      name: string;
      category: "Vegetables" | "Grains" | "Tubers" | "Fruits" | "Legumes";
      description: string;
      qualityGrade: "Grade A" | "Grade B" | "Grade C" | "Organic Certified";
      quantityKg: number;
      pricePerKg: number;
      minOrderKg?: number | undefined;
      packagingType?: string | undefined;
      locationName: string;
      latitude?: number | undefined;
      longitude?: number | undefined;
      images?: string[] | undefined;
    },
  ): { success: boolean; data?: DBProduce; error?: string } {
    const farmer = db.users.get(farmerId);
    if (!farmer || (farmer.role !== "farmer" && farmer.role !== "admin")) {
      return { success: false, error: "Only verified farmers can publish produce listings." };
    }

    if (!data.name || data.quantityKg <= 0 || data.pricePerKg <= 0) {
      return {
        success: false,
        error: "Please provide valid produce name, quantity, and unit price.",
      };
    }

    const produceId = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newProduce: DBProduce = {
      id: produceId,
      farmer_id: farmerId,
      name: data.name.trim(),
      category: data.category,
      description: data.description.trim(),
      quality_grade: data.qualityGrade,
      quantity_kg: Math.round(data.quantityKg),
      available_quantity_kg: Math.round(data.quantityKg),
      price_per_kg: Math.round(data.pricePerKg),
      min_order_kg: data.minOrderKg ?? 50,
      harvest_date: new Date().toISOString().slice(0, 10),
      packaging_type: data.packagingType || "50kg Jute Bag",
      location_name: data.locationName.trim() || farmer.location_name,
      latitude: data.latitude ?? farmer.latitude,
      longitude: data.longitude ?? farmer.longitude,
      images:
        data.images && data.images.length > 0
          ? data.images
          : [
              "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop",
            ],
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.produce.set(newProduce.id, newProduce);
    db.logAudit(farmerId, "PRODUCE_LISTED", "produce", produceId, {
      name: newProduce.name,
      quantityKg: newProduce.quantity_kg,
      pricePerKg: newProduce.price_per_kg,
    });

    return { success: true, data: newProduce };
  }

  /**
   * Toggle produce availability
   */
  static toggleAvailability(
    farmerId: string,
    produceId: string,
  ): { success: boolean; data?: DBProduce; error?: string } {
    const produce = db.produce.get(produceId);
    if (!produce) {
      return { success: false, error: "Produce not found." };
    }

    if (produce.farmer_id !== farmerId && farmerId !== "u-admin-1") {
      return { success: false, error: "Unauthorized. You can only manage your own listings." };
    }

    produce.is_available = !produce.is_available;
    produce.updated_at = new Date().toISOString();
    db.produce.set(produce.id, produce);

    return { success: true, data: produce };
  }
}
