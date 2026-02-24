// Enums for Roles and Status
export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    GESTOR_GERAL = 'GESTOR_GERAL',
    TECNICO_SEGURANCA = 'TECNICO_SEGURANCA',
    ASSISTENTE_OP = 'ASSISTENTE_OP',
    RH = 'RH'
}
  
export enum IncidentSeverity {
    LEVE = 'Leve',
    MODERADO = 'Moderado',
    GRAVE = 'Grave',
    FATAL = 'Fatal'
}

export enum IncidentStatus {
    ABERTO = 'Aberto',
    EM_ANALISE = 'Em Análise',
    PLANO_ACAO = 'Plano de Ação',
    CONCLUIDO = 'Concluído'
}

export enum ModuleType {
    DASHBOARD = 'DASHBOARD',
    OPERATIONAL_DASHBOARD = 'OPERATIONAL_DASHBOARD',
    ACTION_PLANS = 'ACTION_PLANS',
    SST_INSPECTIONS = 'SST_INSPECTIONS',
    SST_ACCIDENTS = 'SST_ACCIDENTS',
    SST_EPI = 'SST_EPI',
    TRAININGS = 'TRAININGS',
    RH = 'RH',
    FLEET = 'FLEET',
    DOCUMENTS = 'DOCUMENTS',
    SETTINGS = 'SETTINGS'
}

export enum ASOStatus {
    VALIDO = 'Válido',
    A_VENCER = 'A Vencer',
    VENCIDO = 'Vencido'
}

export enum InspectionStatus {
    CONCLUIDO = 'Concluído',
    PENDENTE = 'Pendente',
    CRITICO = 'Crítico'
}

export enum ActionPlanStatus {
    PENDENTE = 'Pendente',
    EM_ANDAMENTO = 'Em Andamento',
    CONCLUIDO = 'Concluído',
    ATRASADO = 'Atrasado'
}

export enum TaskFrequency {
    UNICA = 'Única',
    DIARIA = 'Diária',
    SEMANAL = 'Semanal',
    MENSAL = 'Mensal'
}

export enum VehicleStatus {
    DISPONIVEL = 'Disponível',
    EM_USO = 'Em Uso',
    MANUTENCAO = 'Manutenção',
    INDISPONIVEL = 'Indisponível'
}

export enum FleetEventType {
    NO_AUTH = 'Falha de Autenticação (Sem ID)',
    SPEEDING = 'Excesso de Velocidade',
    HARSH_BRAKING = 'Frenagem Brusca',
    IDLING = 'Ociosidade Excessiva'
}

// Data Interfaces
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}

export interface SystemAlert {
    id: string;
    type: 'CRITICAL' | 'WARNING';
    module: 'RH' | 'TRAININGS' | 'SST' | 'EPI';
    title: string;
    message: string;
    date: string; // Date of expiration or event
}

export interface User {
    id: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
}

export interface JobRole {
    id: string;
    title: string;
    sector: string;
    requiredEpiIds: string[]; // IDs of EPIs mandatory for this role
}

export interface Accident {
    id: string;
    date: string;
    description: string;
    location: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
    involvedEmployee: string;
    rootCauseAnalysis?: string; // New field for detailed investigation
}

export interface EPIItem {
    id: string;
    name: string;
    ca: string;
    stock: number;
    minStock: number;
    validity: string; 
}

export interface EPIAssignment {
    id: string;
    employeeId: string;
    employeeName: string;
    epiId: string;
    epiName: string;
    deliveryDate: string;
    expirationDate: string;
    returnDate?: string;
    status: 'Em Uso' | 'Devolvido' | 'Vencido';
}

export interface InspectionItem {
    id: string;
    text: string;
    status: 'OK' | 'NOK' | 'NA';
    observation?: string;
}

export interface Inspection {
    id: string;
    title: string;
    date: string;
    sector: string;
    responsible: string;
    compliance: number;
    status: InspectionStatus;
    items?: InspectionItem[]; // Added detail items
}

export interface Employee {
    id: string;
    name: string;
    roleId: string; // Links to JobRole
    roleName: string; // Denormalized for easier display
    sector: string;
    asoStatus: ASOStatus;
    asoExpiration: string;
    trainingsValues: number;
    status: 'Ativo' | 'Inativo';
    admissionDate: string;
}

// New Interface for Sub-tasks
export interface ActionPlanStep {
    id: string;
    description: string;
    responsible: string;
    deadline: string;
    status: 'Pendente' | 'Concluído';
}

// New Interface for Audit Log
export interface ActionPlanLog {
    id: string;
    date: string;
    user: string;
    type: 'CREATION' | 'UPDATE' | 'COMMENT' | 'STATUS_CHANGE' | 'EXTENSION';
    message: string;
}

export interface ActionPlan {
    id: string;
    origin: 'Acidente' | 'Inspeção' | 'Manual' | 'RH';
    originId?: string;
    description: string;
    responsible: string; // The person overseeing (Tech Safety)
    assignedTo?: string; // Who executes (Assistant, Maintenance)
    deadline: string;
    status: ActionPlanStatus;
    priority: 'Alta' | 'Média' | 'Baixa';
    
    // Enhanced Tracking
    progress: number; // 0 to 100
    steps: ActionPlanStep[];
    logs: ActionPlanLog[];
}

export interface OperationalTask {
    id: string;
    title: string;
    description: string;
    assignedTo: UserRole;
    createdBy: string;
    dueDate: string;
    frequency: TaskFrequency;
    status: 'Pendente' | 'Concluído';
    isSystemGenerated?: boolean;
    // Linking fields
    linkedActionPlanId?: string;
    linkedStepId?: string;
}

export interface Vehicle {
    id: string;
    model: string;
    plate: string;
    status: VehicleStatus;
    mileage: number;
    lastMaintenance: string;
}

export interface DriverStats {
    employeeId: string; // Links to Employee
    cnh: string;
    cnhCategory: string;
    cnhExpiration: string;
    telemetryScore: number; // 0 to 100
    authenticationRate: number; // % of trips correctly identified
    distanceDriven: number; // km current month
    riskLevel: 'Baixo' | 'Médio' | 'Alto';
    history: { month: string; score: number }[];
}

export interface FleetEvent {
    id: string;
    employeeId: string;
    employeeName: string;
    type: FleetEventType;
    date: string;
    description: string;
    pointsDeducted: number;
    // Feedback Fields
    feedbackGiven: boolean;
    feedbackDate?: string;
    feedbackNotes?: string;
}

export interface Training {
    id: string;
    title: string;
    description: string;
    validityMonths: number; // 0 = no expiration
    mandatory: boolean;
}

export interface TrainingRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    trainingId: string;
    trainingTitle: string;
    completionDate: string;
    expirationDate: string | null;
    status: 'Válido' | 'Vencido' | 'A Vencer';
}