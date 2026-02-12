import type { ReportAggregate } from "./reports";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 20 },
  table: { marginTop: 15 },
  row: { flexDirection: "row", borderBottomWidth: 1, padding: 6 },
  header: {
    flexDirection: "row",
    borderBottomWidth: 2,
    padding: 6,
    fontWeight: "bold",
  },
  col1: { width: "40%" },
  col2: { width: "15%" },
  col3: { width: "15%" },
  col4: { width: "30%" },
});

export function ReportPDFDocument({ aggregate }: { aggregate: ReportAggregate }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          Report mensile -{" "}
          {format(parseISO(aggregate.month), "MMMM yyyy", { locale: it })}
        </Text>
        <Text>
          Totale ore: {aggregate.summary.totalHours} | Costo: €
          {aggregate.summary.totalCost.toFixed(2)} | Dipendenti:{" "}
          {aggregate.summary.employeeCount}
        </Text>
        <View style={styles.table}>
          <View style={styles.header}>
            <Text style={styles.col1}>Dipendente</Text>
            <Text style={styles.col2}>Ore ord.</Text>
            <Text style={styles.col3}>Ore str.</Text>
            <Text style={styles.col4}>Costo</Text>
          </View>
          {aggregate.byEmployee.map((e) => (
            <View key={e.employeeId} style={styles.row}>
              <Text style={styles.col1}>{e.employeeName}</Text>
              <Text style={styles.col2}>{e.ordinaryHours}</Text>
              <Text style={styles.col3}>{e.overtimeHours}</Text>
              <Text style={styles.col4}>€{e.totalCost.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
