-- Remove "afternoon" period data (migrating from 3 to 2 shifts per day: morning + evening)
DELETE FROM staffing_requirements WHERE shift_period = 'afternoon';
DELETE FROM employee_availability WHERE shift_period = 'afternoon';
