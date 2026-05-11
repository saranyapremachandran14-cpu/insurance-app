import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

const blue = "#2695db";
const deepBlue = "#0b83cb";
const orange = "#ff720f";
const red = "#ad2531";
const ink = "#0f172a";

const companies = [
  {
    id: "icici",
    name: "ICIC Lombard",
    label: "Fast claim network",
    rating: "4.8",
    color: orange,
    base: { Car: 10000, "Two Wheeler": 2400 },
    addons: [
      { id: "zero", title: "Zero Depreciation", copy: "No depreciation cut during claim settlement.", price: 700 },
      { id: "engine", title: "Engine Protect", copy: "Covers engine damage from water or leakage.", price: 300 },
      { id: "rsa", title: "Roadside Assist", copy: "Towing, battery jumpstart, and flat tyre help.", price: 199 }
    ]
  },
  {
    id: "hdfc",
    name: "HDFC Ergo",
    label: "Cashless garage cover",
    rating: "4.7",
    color: red,
    base: { Car: 9200, "Two Wheeler": 2100 },
    addons: [
      { id: "consumable", title: "Consumables Cover", copy: "Covers nuts, bolts, oil, clips, and small parts.", price: 420 },
      { id: "invoice", title: "Return to Invoice", copy: "Pays invoice value after theft or total loss.", price: 950 },
      { id: "key", title: "Key Replacement", copy: "Replacement cover for lost or damaged keys.", price: 180 }
    ]
  },
  {
    id: "reliance",
    name: "Reliance General",
    label: "Value bundle",
    rating: "4.6",
    color: "#10a3a8",
    base: { Car: 8700, "Two Wheeler": 1950 },
    addons: [
      { id: "ncb", title: "NCB Protect", copy: "Keeps your no-claim bonus after one claim.", price: 520 },
      { id: "personal", title: "Personal Accident", copy: "Extra owner-driver accident coverage.", price: 350 },
      { id: "daily", title: "Daily Allowance", copy: "Daily travel support while vehicle is repaired.", price: 260 }
    ]
  }
];

const vehicleTypes = {
  Car: {
    icon: "car-sport",
    title: "Car Insurance",
    subtitle: "Drive Secure,\nDrive Confident",
    copy: "Compare plans, add covers, and review the total before purchase.",
    cc: ["Under 1000 CC", "1000 - 1500 CC", "Above 1500 CC"]
  },
  "Two Wheeler": {
    icon: "bicycle",
    title: "Two Wheeler Insurance",
    subtitle: "Ride Safe,\nRide Certain",
    copy: "Build quick protection for scooters, bikes, and everyday rides.",
    cc: ["Under 110 CC", "110 - 150 CC", "Above 150 CC"]
  }
};

const initialForm = {
  ownerName: "",
  mobile: "",
  vehicleNumber: "",
  city: ""
};

export default function App() {
  const [step, setStep] = useState("Welcome");
  const [companyId, setCompanyId] = useState(companies[0].id);
  const [vehicleType, setVehicleType] = useState("Car");
  const [cc, setCc] = useState(vehicleTypes.Car.cc[1]);
  const [form, setForm] = useState(initialForm);
  const [selectedAddons, setSelectedAddons] = useState([]);

  const company = companies.find((item) => item.id === companyId) || companies[0];
  const vehicle = vehicleTypes[vehicleType];
  const basePremium = company.base[vehicleType];
  const addonTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const total = basePremium + addonTotal;

  const goVehicle = (type) => {
    setVehicleType(type);
    setCc(vehicleTypes[type].cc[1]);
    setSelectedAddons([]);
  };

  const toggleAddon = (addon) => {
    setSelectedAddons((current) => {
      const exists = current.some((item) => item.id === addon.id);
      return exists ? current.filter((item) => item.id !== addon.id) : [...current, addon];
    });
  };

  const removeAddon = (addonId) => {
    setSelectedAddons((current) => current.filter((item) => item.id !== addonId));
  };

  const content = useMemo(() => {
    if (step === "Welcome") {
      return <WelcomeScreen vehicle={vehicle} onStart={() => setStep("Company")} />;
    }

    if (step === "Company") {
      return (
        <CompanyScreen
          companyId={companyId}
          setCompanyId={setCompanyId}
          onNext={() => setStep("Vehicle")}
        />
      );
    }

    if (step === "Vehicle") {
      return (
        <VehicleScreen
          vehicleType={vehicleType}
          cc={cc}
          setCc={setCc}
          setVehicleType={goVehicle}
          onNext={() => setStep("Details")}
        />
      );
    }

    if (step === "Details") {
      return (
        <DetailsScreen
          form={form}
          setForm={setForm}
          company={company}
          vehicle={vehicle}
          cc={cc}
          onNext={() => setStep("Addons")}
        />
      );
    }

    if (step === "Addons") {
      return (
        <AddonsScreen
          company={company}
          vehicle={vehicle}
          basePremium={basePremium}
          selectedAddons={selectedAddons}
          toggleAddon={toggleAddon}
          total={total}
          onNext={() => setStep("Review")}
        />
      );
    }

    return (
      <ReviewScreen
        company={company}
        vehicleType={vehicleType}
        vehicle={vehicle}
        cc={cc}
        form={form}
        basePremium={basePremium}
        selectedAddons={selectedAddons}
        removeAddon={removeAddon}
        total={total}
        onAddMore={() => setStep("Addons")}
      />
    );
  }, [step, vehicle, companyId, vehicleType, cc, form, company, basePremium, selectedAddons, total]);

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar style={step === "Welcome" ? "light" : "dark"} />
      <View style={styles.shell}>
        {step !== "Welcome" ? (
          <TopBar title={stepTitle(step)} onBack={() => setStep(previousStep(step))} />
        ) : null}
        <ScrollView
          contentContainerStyle={[styles.content, step === "Welcome" && styles.welcomeContent]}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function WelcomeScreen({ vehicle, onStart }) {
  return (
    <View style={styles.welcome}>
      <Text style={styles.welcomeTitle}>{vehicle.subtitle}</Text>
      <Text style={styles.welcomeCopy}>{vehicle.copy}</Text>
      <View style={styles.vehicleShowcase}>
        <View style={styles.ringLarge} />
        <View style={styles.ringSmall} />
        <VehicleArt vehicle={vehicle} large />
      </View>
      <Pressable style={styles.whiteButton} onPress={onStart}>
        <Text style={styles.whiteButtonText}>Get Start</Text>
      </Pressable>
    </View>
  );
}

function CompanyScreen({ companyId, setCompanyId, onNext }) {
  return (
    <>
      <StepHeader eyebrow="Step 1" title="Select your policy company" copy="Choose one insurer first, then build your vehicle plan around it." />
      {companies.map((company) => {
        const active = company.id === companyId;
        return (
          <Pressable
            key={company.id}
            style={[styles.companyCard, active && styles.companyCardActive]}
            onPress={() => setCompanyId(company.id)}
          >
            <View style={[styles.logoBadge, { backgroundColor: company.color }]}>
              <Ionicons name="shield-checkmark" size={24} color="#ffffff" />
            </View>
            <View style={styles.companyBody}>
              <Text style={styles.companyName}>{company.name}</Text>
              <Text style={styles.muted}>{company.label}</Text>
              <Text style={styles.rating}>Rating {company.rating}</Text>
            </View>
            <Ionicons name={active ? "checkmark-circle" : "ellipse-outline"} size={24} color={active ? blue : "#aab7c4"} />
          </Pressable>
        );
      })}
      <FooterButton label="Continue" onPress={onNext} />
    </>
  );
}

function VehicleScreen({ vehicleType, setVehicleType, cc, setCc, onNext }) {
  return (
    <>
      <StepHeader eyebrow="Step 2" title="Choose vehicle type and CC" copy="Pick car or two wheeler, then select the engine capacity." />
      <View style={styles.choiceGrid}>
        {Object.keys(vehicleTypes).map((type) => {
          const active = type === vehicleType;
          return (
            <Pressable
              key={type}
              style={[styles.vehicleChoice, active && styles.vehicleChoiceActive]}
              onPress={() => setVehicleType(type)}
            >
              <Ionicons name={vehicleTypes[type].icon} size={38} color={active ? "#ffffff" : blue} />
              <Text style={[styles.vehicleChoiceText, active && styles.vehicleChoiceTextActive]}>{type}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.sectionTitle}>Engine CC</Text>
      {vehicleTypes[vehicleType].cc.map((option) => (
        <Pressable
          key={option}
          style={[styles.optionRow, cc === option && styles.optionRowActive]}
          onPress={() => setCc(option)}
        >
          <Text style={[styles.optionText, cc === option && styles.optionTextActive]}>{option}</Text>
          <Ionicons name={cc === option ? "checkmark-circle" : "ellipse-outline"} size={22} color={cc === option ? blue : "#aab7c4"} />
        </Pressable>
      ))}
      <FooterButton label="Continue" onPress={onNext} />
    </>
  );
}

function DetailsScreen({ form, setForm, company, vehicle, cc, onNext }) {
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <>
      <StepHeader eyebrow="Step 3" title="Enter customer details" copy="Collect the details needed to prepare the quote summary." />
      <View style={styles.summaryMini}>
        <View style={[styles.logoBadge, { backgroundColor: company.color }]}>
          <Ionicons name={vehicle.icon} size={24} color="#ffffff" />
        </View>
        <View>
          <Text style={styles.summaryMiniTitle}>{company.name}</Text>
          <Text style={styles.muted}>{vehicle.title} / {cc}</Text>
        </View>
      </View>
      <InputField label="Owner name" value={form.ownerName} onChangeText={(value) => setField("ownerName", value)} placeholder="Enter full name" />
      <InputField label="Mobile number" value={form.mobile} onChangeText={(value) => setField("mobile", value)} placeholder="Enter mobile number" keyboardType="phone-pad" />
      <InputField label="Vehicle number" value={form.vehicleNumber} onChangeText={(value) => setField("vehicleNumber", value)} placeholder="GJ 05 AB 1234" />
      <InputField label="City" value={form.city} onChangeText={(value) => setField("city", value)} placeholder="Enter city" />
      <FooterButton label="Continue" onPress={onNext} />
    </>
  );
}

function AddonsScreen({ company, vehicle, basePremium, selectedAddons, toggleAddon, total, onNext }) {
  return (
    <>
      <View style={styles.upgradeHero}>
        <Text style={styles.upgradeTitle}>Add covers to your policy</Text>
        <Text style={styles.watermark}>360</Text>
        <VehicleArt vehicle={vehicle} compact />
      </View>
      <View style={styles.companyStrip}>
        <View style={[styles.logoBadge, { backgroundColor: company.color }]}>
          <Ionicons name="business" size={22} color="#ffffff" />
        </View>
        <View>
          <Text style={styles.companyName}>{company.name}</Text>
          <Text style={styles.muted}>Base premium {formatMoney(basePremium)}</Text>
        </View>
      </View>
      {company.addons.map((addon) => {
        const selected = selectedAddons.some((item) => item.id === addon.id);
        return (
          <View key={addon.id} style={styles.addonRow}>
            <View style={styles.addonText}>
              <Text style={styles.addonTitle}>{addon.title}</Text>
              <Text style={styles.addonCopy}>{addon.copy}</Text>
            </View>
            <Pressable
              style={[styles.addonButton, selected && styles.addonButtonSelected]}
              onPress={() => toggleAddon(addon)}
            >
              <Ionicons name={selected ? "checkmark" : "add"} size={16} color={selected ? "#ffffff" : ink} />
              <Text style={[styles.addonPrice, selected && styles.addonPriceSelected]}>{formatMoney(addon.price)}</Text>
            </Pressable>
          </View>
        );
      })}
      <View style={styles.totalBar}>
        <View>
          <Text style={styles.totalLabel}>Current total</Text>
          <Text style={styles.totalAmount}>{formatMoney(total)}</Text>
        </View>
        <Pressable style={styles.continueButton} onPress={onNext}>
          <Text style={styles.continueText}>Continue</Text>
        </Pressable>
      </View>
    </>
  );
}

function ReviewScreen({ company, vehicleType, vehicle, cc, form, basePremium, selectedAddons, removeAddon, total, onAddMore }) {
  return (
    <>
      <StepHeader eyebrow="Review" title="Total amount" copy="No payment step yet. Review the quote and remove add-ons if needed." />
      <View style={styles.reviewCard}>
        <View style={[styles.logoBadge, { backgroundColor: company.color }]}>
          <Ionicons name={vehicle.icon} size={24} color="#ffffff" />
        </View>
        <View style={styles.reviewBody}>
          <Text style={styles.companyName}>{company.name}</Text>
          <Text style={styles.muted}>{vehicleType} / {cc}</Text>
          <Text style={styles.muted}>{form.ownerName || "Owner name"} / {form.vehicleNumber || "Vehicle number"}</Text>
        </View>
      </View>
      <AmountLine label="Base policy premium" value={basePremium} />
      <Text style={styles.sectionTitle}>Selected add-ons</Text>
      {selectedAddons.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.muted}>No add-ons selected.</Text>
        </View>
      ) : (
        selectedAddons.map((addon) => (
          <View key={addon.id} style={styles.cartRow}>
            <View style={styles.cartText}>
              <Text style={styles.addonTitle}>{addon.title}</Text>
              <Text style={styles.muted}>{formatMoney(addon.price)}</Text>
            </View>
            <Pressable style={styles.removeButton} onPress={() => removeAddon(addon.id)}>
              <Ionicons name="close" size={18} color={red} />
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        ))
      )}
      <Pressable style={styles.addMoreButton} onPress={onAddMore}>
        <Ionicons name="add-circle" size={18} color={blue} />
        <Text style={styles.addMoreText}>Add more covers</Text>
      </Pressable>
      <View style={styles.grandTotal}>
        <Text style={styles.grandTotalLabel}>Total Amount</Text>
        <Text style={styles.grandTotalValue}>{formatMoney(total)}</Text>
      </View>
    </>
  );
}

function TopBar({ title, onBack }) {
  return (
    <View style={styles.topBar}>
      <Pressable onPress={onBack} style={styles.topIcon}>
        <Ionicons name="arrow-back" size={22} color="#ffffff" />
      </Pressable>
      <Text style={styles.topTitle}>{title}</Text>
      <View style={styles.topIcon} />
    </View>
  );
}

function StepHeader({ eyebrow, title, copy }) {
  return (
    <View style={styles.stepHeader}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepCopy}>{copy}</Text>
    </View>
  );
}

function InputField({ label, value, onChangeText, placeholder, keyboardType }) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#95a3b4"
        keyboardType={keyboardType || "default"}
        style={styles.input}
      />
    </View>
  );
}

function FooterButton({ label, onPress }) {
  return (
    <Pressable style={styles.footerButton} onPress={onPress}>
      <Text style={styles.footerButtonText}>{label}</Text>
      <Ionicons name="arrow-forward" size={18} color="#ffffff" />
    </Pressable>
  );
}

function AmountLine({ label, value }) {
  return (
    <View style={styles.amountLine}>
      <Text style={styles.amountLabel}>{label}</Text>
      <Text style={styles.amountValue}>{formatMoney(value)}</Text>
    </View>
  );
}

function VehicleArt({ vehicle, large, compact }) {
  const isBike = vehicle.icon === "bicycle";

  return (
    <View style={[styles.vehicleArt, large && styles.vehicleArtLarge, compact && styles.vehicleArtCompact]}>
      <View style={[styles.vehicleBody, isBike && styles.bikeBody]}>
        <View style={styles.vehicleHighlight} />
        <Ionicons name={vehicle.icon} size={isBike ? 86 : 96} color="#071827" style={styles.vehicleIcon} />
      </View>
      <View style={styles.shadowOval} />
    </View>
  );
}

function previousStep(step) {
  const order = ["Welcome", "Company", "Vehicle", "Details", "Addons", "Review"];
  const index = order.indexOf(step);
  return order[Math.max(0, index - 1)];
}

function stepTitle(step) {
  const titles = {
    Company: "Policy Company",
    Vehicle: "Vehicle",
    Details: "Details",
    Addons: "Add-ons",
    Review: "Summary"
  };
  return titles[step] || step;
}

function formatMoney(value) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: blue
  },
  shell: {
    flex: 1,
    backgroundColor: "#f6f8fd"
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 34
  },
  welcomeContent: {
    flexGrow: 1,
    paddingBottom: 24
  },
  welcome: {
    backgroundColor: blue,
    borderRadius: 8,
    flex: 1,
    minHeight: 720,
    overflow: "hidden",
    padding: 24
  },
  welcomeTitle: {
    color: "#ffffff",
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 38,
    marginTop: 60
  },
  welcomeCopy: {
    color: "#d9f1ff",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
    maxWidth: 280
  },
  vehicleShowcase: {
    alignItems: "center",
    height: 310,
    justifyContent: "center",
    marginTop: 18
  },
  ringLarge: {
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 130,
    borderWidth: 36,
    height: 260,
    position: "absolute",
    width: 260
  },
  ringSmall: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 86,
    height: 172,
    position: "absolute",
    width: 172
  },
  vehicleArt: {
    alignItems: "center",
    justifyContent: "center"
  },
  vehicleArtLarge: {
    transform: [{ scale: 1.24 }]
  },
  vehicleArtCompact: {
    marginTop: 18,
    transform: [{ scale: 1.04 }]
  },
  vehicleBody: {
    alignItems: "center",
    backgroundColor: "#1b9ee7",
    borderRadius: 8,
    height: 116,
    justifyContent: "center",
    width: 188
  },
  bikeBody: {
    width: 170
  },
  vehicleIcon: {
    zIndex: 2
  },
  vehicleHighlight: {
    backgroundColor: "#50c5ff",
    borderRadius: 8,
    height: 34,
    left: 22,
    position: "absolute",
    top: 18,
    width: 98
  },
  shadowOval: {
    backgroundColor: "rgba(5, 29, 44, 0.16)",
    borderRadius: 999,
    height: 16,
    marginTop: -3,
    width: 170
  },
  whiteButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    height: 54,
    justifyContent: "center",
    marginTop: "auto"
  },
  whiteButtonText: {
    color: deepBlue,
    fontSize: 15,
    fontWeight: "900"
  },
  topBar: {
    alignItems: "center",
    backgroundColor: blue,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 64,
    paddingHorizontal: 16
  },
  topIcon: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    width: 38
  },
  topTitle: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "900"
  },
  stepHeader: {
    paddingBottom: 16,
    paddingTop: 20
  },
  eyebrow: {
    color: blue,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  stepTitle: {
    color: ink,
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 31,
    marginTop: 6
  },
  stepCopy: {
    color: "#64748b",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8
  },
  companyCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe7f1",
    borderRadius: 8,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 13,
    marginBottom: 12,
    padding: 14
  },
  companyCardActive: {
    borderColor: blue,
    backgroundColor: "#eef8ff"
  },
  logoBadge: {
    alignItems: "center",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    width: 50
  },
  companyBody: {
    flex: 1
  },
  companyName: {
    color: ink,
    fontSize: 16,
    fontWeight: "900"
  },
  muted: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 3
  },
  rating: {
    color: blue,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 6
  },
  choiceGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20
  },
  vehicleChoice: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe7f1",
    borderRadius: 8,
    borderWidth: 1.5,
    flex: 1,
    minHeight: 132,
    justifyContent: "center",
    padding: 12
  },
  vehicleChoiceActive: {
    backgroundColor: blue,
    borderColor: blue
  },
  vehicleChoiceText: {
    color: blue,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 12,
    textAlign: "center"
  },
  vehicleChoiceTextActive: {
    color: "#ffffff"
  },
  sectionTitle: {
    color: ink,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 10,
    marginTop: 8
  },
  optionRow: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe7f1",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    minHeight: 54,
    paddingHorizontal: 14
  },
  optionRowActive: {
    borderColor: blue,
    backgroundColor: "#eef8ff"
  },
  optionText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "800"
  },
  optionTextActive: {
    color: blue
  },
  summaryMini: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe7f1",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
    padding: 14
  },
  inputWrap: {
    marginBottom: 13
  },
  inputLabel: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 7
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe7f1",
    borderRadius: 8,
    borderWidth: 1,
    color: ink,
    fontSize: 15,
    fontWeight: "700",
    height: 52,
    paddingHorizontal: 14
  },
  upgradeHero: {
    backgroundColor: blue,
    borderRadius: 8,
    minHeight: 248,
    overflow: "hidden",
    paddingHorizontal: 24,
    paddingTop: 26
  },
  upgradeTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
    maxWidth: 270
  },
  watermark: {
    color: "rgba(255,255,255,0.15)",
    fontSize: 58,
    fontWeight: "900",
    position: "absolute",
    right: 38,
    top: 84
  },
  companyStrip: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe7f1",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    marginTop: 12,
    padding: 14
  },
  addonRow: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#e4edf5",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 14
  },
  addonText: {
    flex: 1,
    paddingRight: 12
  },
  addonTitle: {
    color: ink,
    fontSize: 14,
    fontWeight: "900"
  },
  addonCopy: {
    color: "#8b98a8",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5
  },
  addonButton: {
    alignItems: "center",
    borderColor: "#9fb0bd",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 8
  },
  addonButtonSelected: {
    backgroundColor: blue,
    borderColor: blue
  },
  addonPrice: {
    color: ink,
    fontSize: 11,
    fontWeight: "900"
  },
  addonPriceSelected: {
    color: "#ffffff"
  },
  totalBar: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe7f1",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    padding: 14
  },
  totalLabel: {
    color: "#8b98a8",
    fontSize: 12,
    fontWeight: "800"
  },
  totalAmount: {
    color: ink,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 4
  },
  continueButton: {
    backgroundColor: blue,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 13
  },
  continueText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900"
  },
  reviewCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: blue,
    borderRadius: 8,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 14,
    marginBottom: 12,
    padding: 14
  },
  reviewBody: {
    flex: 1
  },
  amountLine: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe7f1",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 14
  },
  amountLabel: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "800"
  },
  amountValue: {
    color: ink,
    fontSize: 15,
    fontWeight: "900"
  },
  emptyBox: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe7f1",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    padding: 16
  },
  cartRow: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#e4edf5",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 14
  },
  cartText: {
    flex: 1,
    paddingRight: 12
  },
  removeButton: {
    alignItems: "center",
    borderColor: "#fecdd3",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  removeText: {
    color: red,
    fontSize: 11,
    fontWeight: "900"
  },
  addMoreButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
    paddingVertical: 10
  },
  addMoreText: {
    color: blue,
    fontSize: 13,
    fontWeight: "900"
  },
  grandTotal: {
    backgroundColor: blue,
    borderRadius: 8,
    marginTop: 10,
    padding: 18
  },
  grandTotalLabel: {
    color: "#d9f1ff",
    fontSize: 13,
    fontWeight: "900"
  },
  grandTotalValue: {
    color: "#ffffff",
    fontSize: 31,
    fontWeight: "900",
    marginTop: 4
  },
  footerButton: {
    alignItems: "center",
    backgroundColor: blue,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 16,
    minHeight: 54
  },
  footerButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900"
  }
});
