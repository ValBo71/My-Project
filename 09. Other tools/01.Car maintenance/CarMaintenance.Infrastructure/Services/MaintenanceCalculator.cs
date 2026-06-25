using System;
using CarMaintenance.Core.Entities;

namespace CarMaintenance.Infrastructure.Services
{
    public static class MaintenanceCalculator
    {
        public static void CalculateNextDue(MaintenanceRule rule, int currentMileage)
        {
            if (!rule.LastDoneDate.HasValue || !rule.LastDoneMileage.HasValue)
            {
                rule.NextDueDate = null;
                rule.NextDueMileage = null;
                rule.Status = "Gray"; // No data
                return;
            }

            // Calculation by mileage
            if (rule.IntervalKm.HasValue)
            {
                rule.NextDueMileage = rule.LastDoneMileage.Value + rule.IntervalKm.Value;
            }
            else
            {
                rule.NextDueMileage = null;
            }

            // Calculation by months
            if (rule.IntervalMonths.HasValue)
            {
                rule.NextDueDate = rule.LastDoneDate.Value.AddMonths(rule.IntervalMonths.Value);
            }
            else
            {
                rule.NextDueDate = null;
            }

            // Determine status (Red, Yellow, Green, Gray)
            DetermineStatus(rule, currentMileage);
        }

        private static void DetermineStatus(MaintenanceRule rule, int currentMileage)
        {
            DateTime today = DateTime.Today;
            bool isOverdue = false;
            bool isWarning = false;
            bool hasCondition = false;

            // Check mileage limits
            if (rule.NextDueMileage.HasValue)
            {
                hasCondition = true;
                int remainingKm = rule.NextDueMileage.Value - currentMileage;
                if (remainingKm <= 0)
                {
                    isOverdue = true;
                }
                else if (remainingKm <= rule.WarningKmBefore)
                {
                    isWarning = true;
                }
            }

            // Check date limits
            if (rule.NextDueDate.HasValue)
            {
                hasCondition = true;
                double remainingDays = (rule.NextDueDate.Value.Date - today).TotalDays;
                if (remainingDays <= 0)
                {
                    isOverdue = true;
                }
                else if (remainingDays <= rule.WarningDaysBefore)
                {
                    isWarning = true;
                }
            }

            if (!hasCondition)
            {
                rule.Status = "Gray";
            }
            else if (isOverdue)
            {
                rule.Status = "Red"; // Overdue
            }
            else if (isWarning)
            {
                rule.Status = "Yellow"; // Warning
            }
            else
            {
                rule.Status = "Green"; // Okay
            }
        }
    }
}
