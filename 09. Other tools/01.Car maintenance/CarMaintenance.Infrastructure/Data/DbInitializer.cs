using System;
using System.Linq;
using CarMaintenance.Core.Entities;
using CarMaintenance.Core.Enums;
using CarMaintenance.Infrastructure.Services;

namespace CarMaintenance.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureCreated();

            // Look for any cars.
            if (context.Cars.Any())
            {
                return;   // DB has been seeded
            }

            // 1. Seed Car 1: Citroën C8
            var car1 = new Car
            {
                Make = "Citroën",
                Model = "C8",
                Engine = "2.2 HDi",
                Year = 2004,
                Fuel = FuelType.Diesel,
                CurrentMileage = 185000,
                RegistrationNumber = "CB 0000 XX",
                Vin = "VF7MOCK0000000000",
                ImagePath = "/images/default_car.png",
                Notes = "Семеен ван, поддържан с внимание."
            };

            // 2. Seed Car 2: Saab 9-5 Aero
            var car2 = new Car
            {
                Make = "Saab",
                Model = "9-5 Aero",
                Engine = "2.3 Turbo",
                Year = 2002,
                Fuel = FuelType.Petrol,
                CurrentMileage = 230000,
                RegistrationNumber = "CB 9999 YY",
                Vin = "YS3MOCK0000000000",
                ImagePath = "/images/saab_95.png",
                Notes = "Спортен седан за удоволствие и динамично шофиране."
            };

            context.Cars.AddRange(car1, car2);
            context.SaveChanges();

            // --- SEED CITROËN C8 LOGS ---
            var histories1 = new[]
            {
                new MileageHistory { CarId = car1.Id, Date = DateTime.Today.AddYears(-3), Mileage = 140000, Source = "ServiceLog", Notes = "Смяна на ангренажен ремък" },
                new MileageHistory { CarId = car1.Id, Date = DateTime.Today.AddMonths(-6), Mileage = 180000, Source = "ServiceLog", Notes = "Смяна на масло" },
                new MileageHistory { CarId = car1.Id, Date = DateTime.Today, Mileage = 185000, Source = "Manual", Notes = "Текущ пробег" }
            };
            context.MileageHistories.AddRange(histories1);

            var service1_1 = new ServiceRecord
            {
                CarId = car1.Id,
                Date = DateTime.Today.AddYears(-3),
                Mileage = 140000,
                Type = RecordType.Repair,
                Category = "Ремъци и голямо обслужване",
                Title = "Ангренажен комплект и водна помпа",
                Description = "Смяна на ангренажен ремък, ролки, водна помпа и пистов ремък.",
                ServiceName = "Автосервиз Експрес",
                PartsCost = 350.00m,
                LaborCost = 150.00m,
                TotalCost = 500.00m,
                Notes = "Части от марка Gates и водна помпа Hepu."
            };

            var service1_2 = new ServiceRecord
            {
                CarId = car1.Id,
                Date = DateTime.Today.AddMonths(-6),
                Mileage = 180000,
                Type = RecordType.Service,
                Category = "Масло и филтри",
                Title = "Смяна на масло и филтри",
                Description = "Сменено моторно масло Total Quartz 9000 5W-40, маслен филтър, въздушен филтър и купе филтър.",
                ServiceName = "Сервиз Ситроен",
                PartsCost = 120.00m,
                LaborCost = 30.00m,
                TotalCost = 150.00m,
                Notes = "Следваща смяна след 10,000 км."
            };

            context.ServiceRecords.AddRange(service1_1, service1_2);
            context.SaveChanges();

            var item1_1 = new ServiceItem
            {
                ServiceRecordId = service1_2.Id,
                Name = "Моторно масло Total Quartz 9000 5W-40",
                Brand = "Total",
                PartNumber = "5W40-5L",
                Quantity = 1m,
                UnitPrice = 75.00m,
                TotalPrice = 75.00m,
                Supplier = "AutoDoc"
            };

            var item1_2 = new ServiceItem
            {
                ServiceRecordId = service1_2.Id,
                Name = "Маслен филтър",
                Brand = "Mann",
                PartNumber = "HU711/51X",
                Quantity = 1m,
                UnitPrice = 15.00m,
                TotalPrice = 15.00m,
                Supplier = "AutoDoc"
            };

            context.ServiceItems.AddRange(item1_1, item1_2);

            var rules1 = new[]
            {
                new MaintenanceRule
                {
                    CarId = car1.Id,
                    Name = "Масло и маслен филтър",
                    Category = "Масло и филтри",
                    IntervalKm = 10000,
                    IntervalMonths = 12,
                    LastDoneMileage = 180000,
                    LastDoneDate = DateTime.Today.AddMonths(-6),
                    WarningKmBefore = 1000,
                    WarningDaysBefore = 30
                },
                new MaintenanceRule
                {
                    CarId = car1.Id,
                    Name = "Ангренажен комплект и ролки",
                    Category = "Ремъци и голямо обслужване",
                    IntervalKm = 100000,
                    IntervalMonths = 60,
                    LastDoneMileage = 140000,
                    LastDoneDate = DateTime.Today.AddYears(-3),
                    WarningKmBefore = 5000,
                    WarningDaysBefore = 90
                },
                new MaintenanceRule
                {
                    CarId = car1.Id,
                    Name = "Спирачна течност",
                    Category = "Спирачки",
                    IntervalKm = null,
                    IntervalMonths = 24,
                    LastDoneMileage = 160000,
                    LastDoneDate = DateTime.Today.AddMonths(-25), // Overdue!
                    WarningKmBefore = 0,
                    WarningDaysBefore = 30
                },
                new MaintenanceRule
                {
                    CarId = car1.Id,
                    Name = "Филтър купе",
                    Category = "Масло и филтри",
                    IntervalKm = 10000,
                    IntervalMonths = 12,
                    LastDoneMileage = 184500,
                    LastDoneDate = DateTime.Today.AddMonths(-1), // Green / OK
                    WarningKmBefore = 1000,
                    WarningDaysBefore = 30
                }
            };

            foreach (var rule in rules1)
            {
                MaintenanceCalculator.CalculateNextDue(rule, car1.CurrentMileage);
                context.MaintenanceRules.Add(rule);
            }

            // --- SEED SAAB 9-5 AERO LOGS ---
            var histories2 = new[]
            {
                new MileageHistory { CarId = car2.Id, Date = DateTime.Today.AddMonths(-3), Mileage = 225000, Source = "ServiceLog", Notes = "Смяна на масло и свещи" },
                new MileageHistory { CarId = car2.Id, Date = DateTime.Today, Mileage = 230000, Source = "Manual", Notes = "Текущ пробег" }
            };
            context.MileageHistories.AddRange(histories2);

            var service2_1 = new ServiceRecord
            {
                CarId = car2.Id,
                Date = DateTime.Today.AddMonths(-3),
                Mileage = 225000,
                Type = RecordType.Service,
                Category = "Масло и филтри",
                Title = "Смяна на масло и запалителни свещи",
                Description = "Смяна на масло Mobil1 0W-40, маслен филтър и запалителни свещи NGK BCR8ES.",
                ServiceName = "Сааб Сервиз София",
                PartsCost = 150.00m,
                LaborCost = 40.00m,
                TotalCost = 190.00m,
                Notes = "Препоръчителна смяна на масло на 10,000 км за турбо бензин."
            };

            context.ServiceRecords.Add(service2_1);
            context.SaveChanges();

            var rule2 = new MaintenanceRule
            {
                CarId = car2.Id,
                Name = "Бензинов двигател - Масло и свещи",
                Category = "Масло и филтри",
                IntervalKm = 10000,
                IntervalMonths = 12,
                LastDoneMileage = 225000,
                LastDoneDate = DateTime.Today.AddMonths(-3),
                WarningKmBefore = 1000,
                WarningDaysBefore = 30
            };

            MaintenanceCalculator.CalculateNextDue(rule2, car2.CurrentMileage);
            context.MaintenanceRules.Add(rule2);

            context.SaveChanges();
        }
    }
}
