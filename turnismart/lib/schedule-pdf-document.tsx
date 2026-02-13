import { format, parseISO, addDays } from "date-fns";
import { it } from "date-fns/locale";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 24, fontFamily: "Helvetica", fontSize: 9 },
  title: { fontSize: 14, marginBottom: 12 },
  table: { marginTop: 8 },
  row: { flexDirection: "row", borderBottomWidth: 0.5, padding: 4 },
  header: { flexDirection: "row", borderBottomWidth: 1, padding: 4, fontWeight: "bold" },
  dayCol: { width: "12%", paddingRight: 4 },
  cellCol: { width: "22%", paddingRight: 4 },
  empCard: { marginBottom: 8, padding: 6, borderWidth: 0.5, borderRadius: 2 },
  empName: { fontWeight: "bold", marginBottom: 4 },
  shiftRow: { flexDirection: "row", marginBottom: 2 },
});

const DAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

type ShiftRow = {
  id: string;
  location_id: string;
  location_name: string;
  employee_id: string;
  employee_name: string;
  role_id: string;
  role_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
};

export function SchedulePDFByLocation({
  weekStart,
  shifts,
  locations,
}: {
  weekStart: string;
  shifts: ShiftRow[];
  locations: { id: string; name: string }[];
}) {
  const start = parseISO(weekStart);
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    format(addDays(start, i), "yyyy-MM-dd")
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          Orario settimanale per sede - {format(start, "d MMM yyyy", { locale: it })} –{" "}
          {format(addDays(start, 6), "d MMM yyyy", { locale: it })}
        </Text>
        {locations.map((loc) => {
          const locShifts = shifts.filter(
            (s) => s.location_id === loc.id && s.status === "active"
          );
          if (locShifts.length === 0) return null;
          return (
            <View key={loc.id} style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 11, fontWeight: "bold", marginBottom: 6 }}>
                {loc.name}
              </Text>
              <View style={styles.table}>
                <View style={styles.header}>
                  <Text style={styles.dayCol}>Giorno</Text>
                  <Text style={styles.cellCol}>Dipendente</Text>
                  <Text style={styles.cellCol}>Ruolo</Text>
                  <Text style={styles.cellCol}>Orario</Text>
                </View>
                {locShifts
                  .sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time))
                  .map((s) => (
                    <View key={s.id} style={styles.row}>
                      <Text style={styles.dayCol}>
                        {DAYS[(new Date(s.date + "T12:00").getDay() + 6) % 7]} {format(parseISO(s.date), "d", { locale: it })}
                      </Text>
                      <Text style={styles.cellCol}>{s.employee_name}</Text>
                      <Text style={styles.cellCol}>{s.role_name}</Text>
                      <Text style={styles.cellCol}>
                        {s.start_time.slice(0, 5)}-{s.end_time.slice(0, 5)}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>
          );
        })}
      </Page>
    </Document>
  );
}

export function SchedulePDFByEmployee({
  weekStart,
  shifts,
  employees,
}: {
  weekStart: string;
  shifts: ShiftRow[];
  employees: { id: string; first_name: string; last_name: string }[];
}) {
  const start = parseISO(weekStart);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          Orario settimanale per dipendente - {format(start, "d MMM yyyy", { locale: it })} –{" "}
          {format(addDays(start, 6), "d MMM yyyy", { locale: it })}
        </Text>
        {employees.map((emp) => {
          const empShifts = shifts.filter(
            (s) => s.employee_id === emp.id && s.status === "active"
          );
          if (empShifts.length === 0) return null;
          const name = `${emp.first_name} ${emp.last_name}`;
          return (
            <View key={emp.id} style={styles.empCard}>
              <Text style={styles.empName}>{name}</Text>
              {empShifts
                .sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time))
                .map((s) => (
                  <View key={s.id} style={styles.shiftRow}>
                    <Text>
                      {format(parseISO(s.date), "EEE d", { locale: it })} - {s.location_name}{" "}
                      ({s.role_name}) {s.start_time.slice(0, 5)}-{s.end_time.slice(0, 5)}
                    </Text>
                  </View>
                ))}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}
