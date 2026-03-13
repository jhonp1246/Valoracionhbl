/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  ClipboardList, 
  TrendingUp, 
  RefreshCcw, 
  User, 
  Heart, 
  AlertTriangle,
  Scale,
  Droplets,
  Brain,
  CheckCircle2,
  Stethoscope,
  Trees,
  Flame,
  Mountain,
  Coins,
  Waves,
  MessageCircle
} from 'lucide-react';

// --- TYPES ---

interface FormData {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  
  // Madera
  wood_tension: string;
  wood_headache: string;
  wood_eyes: string;
  wood_irritable: string;
  wood_cramps: string;
  // Fuego
  fire_sleep: string;
  fire_palpitations: string;
  fire_redface: string;
  fire_tongue: string;
  fire_enthusiasm: string;
  // Tierra
  earth_bloating: string;
  earth_worry: string;
  earth_stool: string;
  earth_sweets: string;
  earth_concentration: string;
  // Metal
  metal_colds: string;
  metal_skin: string;
  metal_sadness: string;
  metal_constipation: string;
  metal_breath: string;
  // Agua
  water_backpain: string;
  water_fears: string;
  water_hearing: string;
  water_cold: string;
  water_hair: string;

  // General Habits
  hydration: string;
  alcohol: string;
  medicalConditions: string;
  supplements: string;
}

interface Diagnosis {
  dominantElement: string;
  imbalance: string;
  score: number;
  bmi: number;
  bmiCategory: string;
  bodyFat: number;
  visceralFat: number;
  summary: string;
  analysis: string;
  recommendations: string[];
  disclaimer: string;
}

// --- CONSTANTS ---

const INITIAL_FORM_DATA: FormData = {
  name: '',
  age: '',
  gender: 'Femenino',
  height: '',
  weight: '',
  
  wood_tension: '',
  wood_headache: '',
  wood_eyes: '',
  wood_irritable: '',
  wood_cramps: '',
  fire_sleep: '',
  fire_palpitations: '',
  fire_redface: '',
  fire_tongue: '',
  fire_enthusiasm: '',
  earth_bloating: '',
  earth_worry: '',
  earth_stool: '',
  earth_sweets: '',
  earth_concentration: '',
  metal_colds: '',
  metal_skin: '',
  metal_sadness: '',
  metal_constipation: '',
  metal_breath: '',
  water_backpain: '',
  water_fears: '',
  water_hearing: '',
  water_cold: '',
  water_hair: '',

  hydration: '1-2L',
  alcohol: 'Nunca',
  medicalConditions: '',
  supplements: '',
};

const STEPS = [
  { id: 1, title: 'Perfil', icon: User },
  { id: 2, title: 'Escaneo Vital', icon: Activity },
  { id: 3, title: 'Hábitos', icon: Heart },
];

const ELEMENTS = [
  { id: 'wood', name: 'Madera', icon: Trees, color: 'text-wood', bg: 'bg-wood/10', border: 'border-wood/20', desc: 'Hígado y Vesícula Biliar', relation: 'Se relaciona con el crecimiento, el movimiento y la planificación.' },
  { id: 'fire', name: 'Fuego', icon: Flame, color: 'text-fire', bg: 'bg-fire/10', border: 'border-fire/20', desc: 'Corazón e Intestino Delgado', relation: 'Se relaciona con la alegría, la sangre y la claridad mental.' },
  { id: 'earth', name: 'Tierra', icon: Mountain, color: 'text-earth', bg: 'bg-earth/10', border: 'border-earth/20', desc: 'Bazo y Estómago', relation: 'Se relaciona con la digestión, el intelecto y la estabilidad.' },
  { id: 'metal', name: 'Metal', icon: Coins, color: 'text-metal', bg: 'bg-metal/10', border: 'border-metal/20', desc: 'Pulmón e Intestino Grueso', relation: 'Se relaciona con la respiración, la piel y el evacuar lo que no sirve.' },
  { id: 'water', name: 'Agua', icon: Waves, color: 'text-water', bg: 'bg-water/10', border: 'border-water/20', desc: 'Riñón y Vejiga', relation: 'Se relaciona con la energía vital, los huesos y la voluntad.' },
];

const ELEMENT_QUESTIONS: Record<string, { name: keyof FormData; label: string }[]> = {
  wood: [
    { name: 'wood_tension', label: '¿Sientes tensión frecuente en el cuello y hombros?' },
    { name: 'wood_headache', label: '¿Sufres de dolores de cabeza (especialmente en los costados o frente)?' },
    { name: 'wood_eyes', label: '¿Tus ojos se cansan rápido, se ponen rojos o ves borroso?' },
    { name: 'wood_irritable', label: '¿Te sientes irritable, con mal genio o frustrado últimamente?' },
    { name: 'wood_cramps', label: '¿Tienes calambres musculares o uñas quebradizas?' },
  ],
  fire: [
    { name: 'fire_sleep', label: '¿Tienes problemas para dormir o te despiertas mucho por la noche?' },
    { name: 'fire_palpitations', label: '¿Sufres de palpitaciones o sientes "ansiedad" en el pecho?' },
    { name: 'fire_redface', label: '¿Te pones muy rojo de la cara con facilidad?' },
    { name: 'fire_tongue', label: '¿Tienes llagas en la lengua o hablas demasiado rápido?' },
    { name: 'fire_enthusiasm', label: '¿Te falta entusiasmo (vitalidad) o, por el contrario, estás "demasiado" alterado/da?' },
  ],
  earth: [
    { name: 'earth_bloating', label: '¿Sientes pesadez abdominal o hinchazón después de comer?' },
    { name: 'earth_worry', label: '¿Le das demasiadas vueltas a las cosas (preocupación excesiva)?' },
    { name: 'earth_stool', label: '¿Tus heces son blandas o sientes debilidad en los músculos?' },
    { name: 'earth_sweets', label: '¿Tienes antojos constantes de cosas dulces?' },
    { name: 'earth_concentration', label: '¿Te cuesta concentrarte o sientes "fatiga mental"?' },
  ],
  metal: [
    { name: 'metal_colds', label: '¿Te resfrías con mucha frecuencia o tienes alergias?' },
    { name: 'metal_skin', label: '¿Sufres de piel seca, eczemas o problemas cutáneos?' },
    { name: 'metal_sadness', label: '¿Tienes tendencia a la tristeza o la melancolía?' },
    { name: 'metal_constipation', label: '¿Sufres de estreñimiento o problemas de colon?' },
    { name: 'metal_breath', label: '¿Sientes falta de aire o cansancio al hablar mucho?' },
  ],
  water: [
    { name: 'water_backpain', label: '¿Sufres de dolor o debilidad en la zona lumbar o rodillas?' },
    { name: 'water_fears', label: '¿Tienes miedos o inseguridades que te paralizan?' },
    { name: 'water_hearing', label: '¿Has notado pérdida de audición o zumbidos en los oídos (tinnitus)?' },
    { name: 'water_cold', label: '¿Sientes mucho frío en los pies y las manos?' },
    { name: 'water_hair', label: '¿Se te cae mucho el cabello o tienes problemas dentales (caries)?' },
  ],
};

// --- COMPONENTS ---

const InputField = ({ label, name, type = 'text', value, onChange, placeholder, icon: Icon, min, max }: any) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-brand" />}
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all shadow-sm"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, icon: Icon }: any) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-brand" />}
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all shadow-sm appearance-none cursor-pointer"
    >
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const DescriptiveField = ({ label, name, value, onChange, icon: Icon }: any) => (
  <div className="space-y-3 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all hover:border-brand/30 group">
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand/5 transition-colors">
        {Icon ? <Icon className="w-5 h-5 text-slate-400 group-hover:text-brand transition-colors" /> : <Activity className="w-5 h-5 text-slate-400 group-hover:text-brand transition-colors" />}
      </div>
      <div className="space-y-1">
        <span className="text-sm font-bold text-slate-800 leading-tight block">{label}</span>
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Describe tu síntoma o escribe "No"</p>
      </div>
    </div>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder="Ej: Siento mucha tensión en el trapecio derecho al final del día..."
      className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all resize-none min-h-[100px] placeholder:text-slate-300"
    />
  </div>
);

const StepWrapper = ({ children, title, description }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div className="space-y-1">
      <h2 className="text-2xl font-serif font-bold text-slate-900">{title}</h2>
      <p className="text-slate-500 text-sm">{description}</p>
    </div>
    {children}
  </motion.div>
);

// --- MAIN APP ---

export default function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const bmi = useMemo(() => {
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height) / 100;
    if (!w || !h) return 0;
    return parseFloat((w / (h * h)).toFixed(1));
  }, [formData.weight, formData.height]);

  const bmiCategory = useMemo(() => {
    if (bmi === 0) return '';
    if (bmi < 18.5) return 'Bajo peso';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Sobrepeso';
    return 'Obesidad';
  }, [bmi]);

  const handleNext = () => {
    if (step === 1 && (!formData.name || !formData.age || !formData.height || !formData.weight)) {
      setError("Por favor completa los campos de perfil.");
      return;
    }
    setError(null);
    setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);

  const generateDiagnosis = async () => {
    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = "gemini-3-flash-preview";
      
      const prompt = `
        Actúa como un experto en Medicina Tradicional China (MTC) y Nutrición Clínica.
        Analiza el "Escaneo de Energía Vital" y los datos antropométricos del usuario.
        Genera una valoración profesional.
        
        DATOS DEL USUARIO:
        - Nombre: ${formData.name}
        - Edad: ${formData.age}
        - Género: ${formData.gender}
        - Altura: ${formData.height}cm, Peso: ${formData.weight}kg
        - IMC Calculado: ${bmi} (${bmiCategory})
        
        ESCANEO DE ELEMENTOS (Descripciones detalladas de síntomas):
        Madera: Tensión: ${formData.wood_tension || 'No'}, Cefalea: ${formData.wood_headache || 'No'}, Ojos: ${formData.wood_eyes || 'No'}, Irritabilidad: ${formData.wood_irritable || 'No'}, Calambres: ${formData.wood_cramps || 'No'}
        Fuego: Sueño: ${formData.fire_sleep || 'No'}, Palpitaciones: ${formData.fire_palpitations || 'No'}, Cara Roja: ${formData.fire_redface || 'No'}, Lengua: ${formData.fire_tongue || 'No'}, Entusiasmo: ${formData.fire_enthusiasm || 'No'}
        Tierra: Hinchazón: ${formData.earth_bloating || 'No'}, Preocupación: ${formData.earth_worry || 'No'}, Heces: ${formData.earth_stool || 'No'}, Dulces: ${formData.earth_sweets || 'No'}, Concentración: ${formData.earth_concentration || 'No'}
        Metal: Resfriados: ${formData.metal_colds || 'No'}, Piel: ${formData.metal_skin || 'No'}, Tristeza: ${formData.metal_sadness || 'No'}, Estreñimiento: ${formData.metal_constipation || 'No'}, Respiración: ${formData.metal_breath || 'No'}
        Agua: Lumbar: ${formData.water_backpain || 'No'}, Miedos: ${formData.water_fears || 'No'}, Audición: ${formData.water_hearing || 'No'}, Frío: ${formData.water_cold || 'No'}, Cabello: ${formData.water_hair || 'No'}
        
        HÁBITOS:
        - Hidratación: ${formData.hydration}
        - Alcohol: ${formData.alcohol}
        - Condiciones: ${formData.medicalConditions || 'Ninguna'}
        - Suplementos: ${formData.supplements || 'Ninguno'}

        INSTRUCCIONES IMPORTANTES:
        - En el campo "analysis", dirígete al usuario por su nombre (${formData.name}). Por ejemplo: "${formData.name} de ${formData.age} años presenta..." en lugar de "El paciente...".
        - El tono debe ser profesional pero cercano.

        RESPONDE ÚNICAMENTE EN FORMATO JSON con la siguiente estructura:
        {
          "dominantElement": (Nombre del elemento predominante),
          "imbalance": (Descripción breve del desequilibrio),
          "score": (número del 1 al 100 de vitalidad general),
          "bmi": ${bmi},
          "bmiCategory": "${bmiCategory}",
          "bodyFat": (Estimación del % de grasa corporal basado en edad/sexo/IMC),
          "visceralFat": (Estimación del nivel de grasa visceral 1-20 basado en datos),
          "summary": (un párrafo profesional resumiendo su estado desde la MTC),
          "analysis": (una valoración detallada de la relación entre sus síntomas y los elementos, usando el nombre del usuario),
          "recommendations": (un array de 4-5 recomendaciones dietéticas y de estilo de vida),
          "disclaimer": (un aviso legal estándar sobre valoración de salud profesional)
        }
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      setDiagnosis(result);
      setStep(4);
    } catch (err) {
      console.error(err);
      setError("Hubo un error al generar tu escaneo vital. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setDiagnosis(null);
    setFormData(INITIAL_FORM_DATA);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-slate-50">
      <div className="w-full max-w-2xl">
        
        {/* Header */}
        <div className="text-center mb-10 space-y-2">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 text-brand rounded-full text-xs font-bold tracking-wider uppercase"
          >
            <Activity className="w-3 h-3" />
            NutriGenius: Escaneo Vital
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-serif font-black text-slate-900 tracking-tight">
            Tu Valoración <span className="text-brand italic">Nutricional.</span>
          </h1>
          <p className="text-slate-500 max-w-md mx-auto">
            Basado en tus datos personales y hábitos.
          </p>
        </div>

        {/* Progress Bar */}
        {step <= 3 && (
          <div className="mb-8 px-4">
            <div className="flex justify-between mb-2">
              {STEPS.map((s) => (
                <div 
                  key={s.id} 
                  className={`flex flex-col items-center gap-1 transition-all duration-300 ${step >= s.id ? 'text-brand' : 'text-slate-300'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= s.id ? 'border-brand bg-brand/5' : 'border-slate-200 bg-white'}`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{s.title}</span>
                </div>
              ))}
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-brand"
                initial={{ width: "0%" }}
                animate={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-10">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <StepWrapper 
                  key="step1"
                  title="Perfil Básico" 
                  description="Datos fundamentales para contextualizar tu energía."
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <InputField label="Nombre Completo" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Ej: Maria Garcia" icon={User} />
                    </div>
                    <InputField label="Edad" name="age" type="number" value={formData.age} onChange={handleChange} placeholder="Ej: 35" icon={Activity} />
                    <SelectField label="Género" name="gender" value={formData.gender} onChange={handleChange} options={['Femenino', 'Masculino', 'Otro']} />
                    <InputField label="Altura (cm)" name="height" type="number" value={formData.height} onChange={handleChange} placeholder="Ej: 165" icon={TrendingUp} />
                    <InputField label="Peso (kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} placeholder="Ej: 62" icon={Scale} />
                  </div>
                </StepWrapper>
              )}

              {step === 2 && (
                <StepWrapper 
                  key="step2"
                  title="Escaneo de Energía Vital" 
                  description="Responde honestamente para identificar desequilibrios en tus elementos."
                >
                  <div className="space-y-8">
                    {ELEMENTS.map((el) => (
                      <div key={el.id} className="space-y-4">
                        <div className={`p-4 rounded-2xl border ${el.border} ${el.bg} space-y-1`}>
                          <div className={`flex items-center gap-2 ${el.color} font-bold text-sm uppercase tracking-widest`}>
                            <el.icon className="w-5 h-5" /> Elemento {el.name} ({el.desc})
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium italic">{el.relation}</p>
                        </div>
                        <div className="space-y-4">
                          {ELEMENT_QUESTIONS[el.id].map((q) => (
                            <DescriptiveField 
                              key={q.name}
                              label={q.label} 
                              name={q.name} 
                              value={formData[q.name]} 
                              onChange={handleChange} 
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </StepWrapper>
              )}

              {step === 3 && (
                <StepWrapper 
                  key="step3"
                  title="Hábitos & Salud" 
                  description="Información complementaria para el diagnóstico final."
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <SelectField 
                        label="Hidratación" 
                        name="hydration" 
                        value={formData.hydration} 
                        onChange={handleChange} 
                        options={['Menos de 1L', '1-2L', 'Más de 2L']} 
                        icon={Droplets}
                      />
                      <SelectField 
                        label="Consumo de Alcohol" 
                        name="alcohol" 
                        value={formData.alcohol} 
                        onChange={handleChange} 
                        options={['Nunca', 'Ocasionalmente', 'Frecuentemente']} 
                      />
                    </div>
                    <InputField 
                      label="Condiciones Médicas" 
                      name="medicalConditions" 
                      value={formData.medicalConditions} 
                      onChange={handleChange} 
                      placeholder="Ej: Ninguna" 
                    />
                    <InputField 
                      label="Suplementos" 
                      name="supplements" 
                      value={formData.supplements} 
                      onChange={handleChange} 
                      placeholder="Ej: Ninguno" 
                    />
                  </div>
                </StepWrapper>
              )}

              {step === 4 && diagnosis && (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 border-brand/20 bg-white shadow-xl`}>
                        <span className="text-3xl font-black text-slate-900">{diagnosis.score}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Vitalidad</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="inline-block px-4 py-1 bg-brand/5 text-brand rounded-full text-xs font-black uppercase tracking-widest border border-brand/10">
                        {diagnosis.dominantElement}
                      </div>
                      <h2 className="text-2xl font-serif font-bold text-slate-900">Tu Valoración Energética</h2>
                      <p className="text-slate-500 text-sm max-w-sm mx-auto italic">"{diagnosis.imbalance}"</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">IMC</p>
                        <p className="text-xl font-black text-slate-900">{diagnosis.bmi}</p>
                        <p className="text-[10px] font-medium text-brand">{diagnosis.bmiCategory}</p>
                      </div>
                      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">% Grasa</p>
                        <p className="text-xl font-black text-slate-900">{diagnosis.bodyFat}%</p>
                        <p className="text-[10px] font-medium text-slate-400">Estimado</p>
                      </div>
                      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">G. Visceral</p>
                        <p className="text-xl font-black text-slate-900">{diagnosis.visceralFat}</p>
                        <p className="text-[10px] font-medium text-slate-400">Nivel</p>
                      </div>
                    </div>

                    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider">
                        <Brain className="w-4 h-4 text-brand" />
                        Valoración de los 5 Elementos
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{diagnosis.summary}</p>
                      <div className="pt-2 border-t border-slate-50">
                        <p className="text-slate-500 text-xs leading-relaxed italic">{diagnosis.analysis}</p>
                      </div>
                    </div>

                    <div className="p-6 bg-brand/5 rounded-2xl border border-brand/10 space-y-4">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-brand uppercase tracking-wider">
                        <Zap className="w-4 h-4" />
                        Dietoterapia & Estilo de Vida
                      </h3>
                      <ul className="space-y-3">
                        {diagnosis.recommendations?.map((rec, i) => (
                          <motion.li 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-3 text-sm text-slate-700"
                          >
                            <CheckCircle2 className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                            {rec}
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">¿Cómo leer tus resultados?</h3>
                      <ul className="space-y-3 text-xs text-slate-600">
                        <li className="flex gap-2">
                          <span className="font-bold text-brand">•</span>
                          <span><strong>Descripciones detalladas:</strong> Cuanto más específico seas en tus respuestas, más precisa será la valoración de la IA sobre tus desequilibrios.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-brand">•</span>
                          <span><strong>Varios elementos mezclados:</strong> Es normal sentir síntomas de diferentes grupos. En la MTC, los elementos se alimentan entre sí (como la Madera alimenta al Fuego).</span>
                        </li>
                      </ul>
                    </div>
                    <div className="p-8 bg-slate-900 text-white rounded-3xl space-y-6 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-brand/30 transition-colors" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand/10 blur-2xl rounded-full -ml-12 -mb-12" />
                      
                      <div className="relative space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                          Asesoría Personalizada
                        </div>
                        <h3 className="text-xl sm:text-2xl font-serif font-bold leading-tight">
                          "Deja que tu comida sea tu medicina: <span className="text-brand italic">Da el paso hacia una vida sin dolor"</span>
                        </h3>
                        
                        <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-light">
                          <p>
                            Tus resultados actuales son apenas el umbral de una transformación mucho más profunda, pero para construir una salud verdaderamente inquebrantable necesitamos la arquitectura de la personalización. Te invitamos a dar el paso definitivo: <strong>contactar a tu asesor nutricional</strong> para diseñar un plan de alimentación a medida, fundamentado en la sabiduría de los 5 elementos (Madera, Fuego, Tierra, Metal y Agua).
                          </p>
                          <p>
                            Este enfoque no se trata simplemente de contar calorías, sino de armonizar tu energía vital. Al alinear tu nutrición con estos elementos naturales, logramos neutralizar la inflamación, eliminar dolores persistentes y devolverle a tu cuerpo la agilidad necesaria para una vida plena y activa. Es momento de dejar de comer por inercia y empezar a nutrirse con propósito.
                          </p>
                          <p className="text-slate-100 font-medium italic">
                            Recuerda la máxima que rige nuestro método: que tu comida sea tu alimento y tu alimento sea tu medicina. No permitas que recomendaciones genéricas dicten tu bienestar; obtén una hoja de ruta diseñada exclusivamente para tu función y necesidades únicas. ¡Tu camino hacia una vitalidad sin límites comienza con esta asesoría personalizada!
                          </p>
                        </div>

                        <button className="w-full py-4 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-2 group/btn">
                          <MessageCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                          Contactar a mi Asesor
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-[11px] text-amber-900 font-bold uppercase tracking-wider">Nota amigable</p>
                      <p className="text-[11px] text-amber-700 leading-tight italic">
                        Este formulario es una guía de autoconocimiento, no un diagnóstico médico. Si tienes un dolor persistente, siempre es bueno consultar con un profesional.
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={reset}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Nuevo Escaneo Vital
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {step <= 3 && (
              <div className="mt-10 flex gap-4">
                {step > 1 && (
                  <button 
                    onClick={handleBack}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Atrás
                  </button>
                )}
                <button 
                  onClick={step === 3 ? generateDiagnosis : handleNext}
                  disabled={loading}
                  className="flex-[2] py-4 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                      Escaneando Energía...
                    </>
                  ) : (
                    <>
                      {step === 3 ? 'Finalizar Escaneo' : 'Siguiente'}
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Elements Quick Guide */}
        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 grid grid-cols-5 gap-2"
          >
            {ELEMENTS.map((el) => (
              <div key={el.id} className={`p-2 rounded-xl border ${el.border} ${el.bg} text-center space-y-1`}>
                <el.icon className={`w-4 h-4 mx-auto ${el.color}`} />
                <p className="text-[8px] font-black uppercase tracking-tighter text-slate-500">{el.name}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            Wu Xing Vital Scan & Dietoterapia China
          </p>
        </div>

        {/* Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-600 text-white rounded-full shadow-2xl flex items-center gap-3 z-50"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-bold">{error}</span>
              <button onClick={() => setError(null)} className="ml-2 hover:opacity-70">×</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
