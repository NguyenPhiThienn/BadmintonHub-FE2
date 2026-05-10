export interface IRevenueStats {
  summary: {
    totalRevenue: number;
    totalBookings: number;
  };
  details: {
    _id: {
      year: number;
      month: number;
      day: number;
    };
    totalRevenue: number;
    count: number;
  }[];
}

export interface IOccupancyData {
  _id: string;
  date: string;
  bookedHours: number;
  capacity: number;
  occupancyRate: number;
}

export interface IOccupancyStats {
  occupancyData: IOccupancyData[];
}
