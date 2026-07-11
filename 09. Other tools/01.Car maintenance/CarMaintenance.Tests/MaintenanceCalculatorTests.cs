using System;
using CarMaintenance.Core.Entities;
using CarMaintenance.Infrastructure.Services;
using Xunit;

namespace CarMaintenance.Tests
{
    public class MaintenanceCalculatorTests
    {
        private static MaintenanceRule NewRule(int? intervalKm = null, int? intervalMonths = null,
            int? lastDoneMileage = null, DateTime? lastDoneDate = null,
            int warningKmBefore = 1000, int warningDaysBefore = 30)
        {
            return new MaintenanceRule
            {
                CarId = 1,
                Name = "Test rule",
                Category = "Test",
                IntervalKm = intervalKm,
                IntervalMonths = intervalMonths,
                LastDoneMileage = lastDoneMileage,
                LastDoneDate = lastDoneDate,
                WarningKmBefore = warningKmBefore,
                WarningDaysBefore = warningDaysBefore,
            };
        }

        [Fact]
        public void NoLastDoneData_ResultsInGrayStatusAndNullDueValues()
        {
            var rule = NewRule();

            MaintenanceCalculator.CalculateNextDue(rule, currentMileage: 50000);

            Assert.Equal("Gray", rule.Status);
            Assert.Null(rule.NextDueDate);
            Assert.Null(rule.NextDueMileage);
        }

        [Fact]
        public void MileageBased_PastDueMileage_IsRed()
        {
            var rule = NewRule(intervalKm: 10000, lastDoneMileage: 90000, lastDoneDate: DateTime.Today.AddYears(-1));

            MaintenanceCalculator.CalculateNextDue(rule, currentMileage: 100000);

            Assert.Equal(100000, rule.NextDueMileage);
            Assert.Equal("Red", rule.Status);
        }

        [Fact]
        public void MileageBased_WithinWarningWindow_IsYellow()
        {
            var rule = NewRule(intervalKm: 10000, lastDoneMileage: 90000, lastDoneDate: DateTime.Today.AddYears(-1), warningKmBefore: 1000);

            // NextDueMileage = 100000, currentMileage = 99500 -> remaining 500 <= warning(1000)
            MaintenanceCalculator.CalculateNextDue(rule, currentMileage: 99500);

            Assert.Equal("Yellow", rule.Status);
        }

        [Fact]
        public void MileageBased_FarFromDue_IsGreen()
        {
            var rule = NewRule(intervalKm: 10000, lastDoneMileage: 90000, lastDoneDate: DateTime.Today.AddYears(-1), warningKmBefore: 1000);

            MaintenanceCalculator.CalculateNextDue(rule, currentMileage: 85000);

            Assert.Equal("Green", rule.Status);
        }

        [Fact]
        public void DateBased_PastDueDate_IsRed()
        {
            var rule = NewRule(intervalMonths: 12, lastDoneMileage: 90000, lastDoneDate: DateTime.Today.AddMonths(-13));

            MaintenanceCalculator.CalculateNextDue(rule, currentMileage: 90500);

            Assert.True(rule.NextDueDate < DateTime.Today);
            Assert.Equal("Red", rule.Status);
        }

        [Fact]
        public void DateBased_WithinWarningWindow_IsYellow()
        {
            var rule = NewRule(intervalMonths: 12, lastDoneMileage: 90000, lastDoneDate: DateTime.Today.AddMonths(-12).AddDays(20), warningDaysBefore: 30);

            MaintenanceCalculator.CalculateNextDue(rule, currentMileage: 90500);

            Assert.Equal("Yellow", rule.Status);
        }

        [Fact]
        public void BothMileageAndDateSet_OverdueOnEitherWins_Red()
        {
            // Mileage is fine (far from due), but date is overdue -> overall Red.
            var rule = NewRule(intervalKm: 10000, intervalMonths: 12, lastDoneMileage: 90000, lastDoneDate: DateTime.Today.AddMonths(-13));

            MaintenanceCalculator.CalculateNextDue(rule, currentMileage: 91000);

            Assert.Equal("Red", rule.Status);
        }

        [Fact]
        public void NoIntervalsConfigured_ResultsInGray()
        {
            // LastDone data present, but neither IntervalKm nor IntervalMonths set -> nothing to check against.
            var rule = NewRule(lastDoneMileage: 90000, lastDoneDate: DateTime.Today.AddMonths(-1));

            MaintenanceCalculator.CalculateNextDue(rule, currentMileage: 91000);

            Assert.Null(rule.NextDueMileage);
            Assert.Null(rule.NextDueDate);
            Assert.Equal("Gray", rule.Status);
        }
    }
}
