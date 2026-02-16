#!/usr/bin/env python3
"""
OR-Tools CP-SAT solver per scheduling settimanale.
Legge JSON da stdin, scrive JSON su stdout.
Input: { slots, employees, periodTimes, fixedAssignments, weekStart }
Output: { status, shifts?, error?, infeasibleReason? }
"""
import json
import sys

from solver_core import solve


if __name__ == "__main__":
    data = json.load(sys.stdin)
    result = solve(data)
    print(json.dumps(result))
