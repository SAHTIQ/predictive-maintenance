"""
Rule-Based Maintenance Engine (Layer 2)
SPDX-License-Identifier: MIT

Evaluates physical sensor inputs against deterministic industrial domain thresholds.
Provides rule violation descriptions and deterministic rule-based health classification.
"""

from backend.app.config import settings
from backend.app.schemas.prediction import RuleViolation, RulePredictionResult

class MaintenanceRuleEngine:
    def __init__(self):
        self.temp_warn = settings.TEMP_WARNING_THRESHOLD
        self.temp_crit = settings.TEMP_CRITICAL_THRESHOLD
        self.vib_warn = settings.VIB_WARNING_THRESHOLD
        self.vib_crit = settings.VIB_CRITICAL_THRESHOLD
        self.press_min = settings.PRESS_MIN_THRESHOLD
        self.press_max = settings.PRESS_MAX_THRESHOLD
        self.curr_warn = settings.CURRENT_WARNING_THRESHOLD
        self.curr_crit = settings.CURRENT_CRITICAL_THRESHOLD
        self.volt_min = settings.VOLTAGE_MIN_THRESHOLD
        self.volt_max = settings.VOLTAGE_MAX_THRESHOLD

    def evaluate(self, features: dict[str, float]) -> RulePredictionResult:
        violations: list[RuleViolation] = []

        temp = features.get("temperature", 0.0)
        vib = features.get("vibration", 0.0)
        press = features.get("pressure", 0.0)
        curr = features.get("current", 0.0)
        volt = features.get("voltage", 0.0)

        # Temperature checks
        if temp >= self.temp_crit:
            violations.append(RuleViolation(
                parameter="temperature",
                observed_value=temp,
                threshold=self.temp_crit,
                severity="Critical",
                message=f"Critical operating temperature: {temp:.1f}°C exceeds threshold ({self.temp_crit:.1f}°C)"
            ))
        elif temp >= self.temp_warn:
            violations.append(RuleViolation(
                parameter="temperature",
                observed_value=temp,
                threshold=self.temp_warn,
                severity="Warning",
                message=f"Elevated operating temperature: {temp:.1f}°C exceeds warning limit ({self.temp_warn:.1f}°C)"
            ))

        # Vibration checks (ISO 10816 standards)
        if vib >= self.vib_crit:
            violations.append(RuleViolation(
                parameter="vibration",
                observed_value=vib,
                threshold=self.vib_crit,
                severity="Critical",
                message=f"Severe mechanical vibration: {vib:.2f} mm/s exceeds critical limit ({self.vib_crit:.2f} mm/s)"
            ))
        elif vib >= self.vib_warn:
            violations.append(RuleViolation(
                parameter="vibration",
                observed_value=vib,
                threshold=self.vib_warn,
                severity="Warning",
                message=f"Elevated mechanical vibration: {vib:.2f} mm/s exceeds warning limit ({self.vib_warn:.2f} mm/s)"
            ))

        # Pressure checks
        if press > self.press_max:
            violations.append(RuleViolation(
                parameter="pressure",
                observed_value=press,
                threshold=self.press_max,
                severity="Warning",
                message=f"Hydraulic pressure surge: {press:.2f} bar exceeds limit ({self.press_max:.2f} bar)"
            ))
        elif press < self.press_min:
            violations.append(RuleViolation(
                parameter="pressure",
                observed_value=press,
                threshold=self.press_min,
                severity="Warning",
                message=f"Pressure drop / suction loss: {press:.2f} bar below minimum ({self.press_min:.2f} bar)"
            ))

        # Electrical Current checks
        if curr >= self.curr_crit:
            violations.append(RuleViolation(
                parameter="current",
                observed_value=curr,
                threshold=self.curr_crit,
                severity="Critical",
                message=f"High motor current surge: {curr:.1f} A exceeds critical limit ({self.curr_crit:.1f} A)"
            ))
        elif curr >= self.curr_warn:
            violations.append(RuleViolation(
                parameter="current",
                observed_value=curr,
                threshold=self.curr_warn,
                severity="Warning",
                message=f"High electrical load: {curr:.1f} A exceeds warning limit ({self.curr_warn:.1f} A)"
            ))

        # Voltage stability checks
        if volt < self.volt_min or volt > self.volt_max:
            violations.append(RuleViolation(
                parameter="voltage",
                observed_value=volt,
                threshold=self.volt_min if volt < self.volt_min else self.volt_max,
                severity="Warning",
                message=f"Voltage out of nominal tolerance (370V-430V): observed {volt:.1f} V"
            ))

        # Determine aggregate rule status
        has_critical = any(v.severity == "Critical" for v in violations)
        has_multiple_warnings = sum(1 for v in violations if v.severity == "Warning") >= 2

        if has_critical or has_multiple_warnings:
            prediction = "Critical" if has_critical else "Warning"
        elif len(violations) > 0:
            prediction = "Warning"
        else:
            prediction = "Healthy"

        return RulePredictionResult(
            prediction=prediction,
            violations=violations
        )

rule_engine = MaintenanceRuleEngine()
