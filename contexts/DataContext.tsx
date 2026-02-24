import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { 
    Accident, IncidentSeverity, IncidentStatus, 
    EPIItem, Inspection, Employee, 
    ASOStatus, InspectionStatus,
    ActionPlan, OperationalTask, ActionPlanStatus, TaskFrequency, EPIAssignment,
    UserRole, JobRole, Vehicle, VehicleStatus, DriverStats, FleetEvent, FleetEventType, Notification,
    Training, TrainingRecord, ModuleType, SystemAlert, ActionPlanStep, ActionPlanLog
} from '../types';

// Mock Initial Data
const INITIAL_ACCIDENTS: Accident[] = [
    { 
        id: 'AC-2023-001', 
        date: '2023-10-01', 
        description: 'Queda de nível', 
        location: 'Armazém B', 
        severity: IncidentSeverity.MODERADO, 
        status: IncidentStatus.PLANO_ACAO, 
        involvedEmployee: 'João Santos',
        rootCauseAnalysis: 'O colaborador tropeçou em um pallet deixado fora da área demarcada. Falta de sinalização no solo identificada.'
    },
];

const INITIAL_EPI: EPIItem[] = [
    { id: '1', name: 'Capacete de Segurança Aba Frontal', ca: '12345', stock: 45, minStock: 20, validity: '2025-12-01' },
    { id: '2', name: 'Luva de Vaqueta', ca: '54321', stock: 12, minStock: 30, validity: '2024-06-15' },
    { id: '3', name: 'Óculos de Proteção Incolor', ca: '98765', stock: 100, minStock: 50, validity: '2026-01-20' },
    { id: '4', name: 'Protetor Auricular Plug', ca: '11223', stock: 200, minStock: 50, validity: '2025-01-01' },
];

const INITIAL_ROLES: JobRole[] = [
    { id: 'role-1', title: 'Motorista de Caminhão', sector: 'Logística', requiredEpiIds: ['1', '2', '3'] },
    { id: 'role-2', title: 'Auxiliar Logístico', sector: 'Logística', requiredEpiIds: ['1', '2'] },
    { id: 'role-3', title: 'Analista Administrativo', sector: 'Escritório', requiredEpiIds: [] },
    { id: 'role-4', title: 'Soldador', sector: 'Manutenção', requiredEpiIds: ['1', '2', '3', '4'] },
];

const INITIAL_ASSIGNMENTS: EPIAssignment[] = [
    { id: 'ea1', employeeId: '3', employeeName: 'Roberto Diaz', epiId: '2', epiName: 'Luva de Vaqueta', deliveryDate: '2023-09-01', expirationDate: '2023-10-01', status: 'Vencido' },
    { id: 'ea2', employeeId: '1', employeeName: 'Carlos Ferreira', epiId: '1', epiName: 'Capacete de Segurança Aba Frontal', deliveryDate: '2023-01-10', expirationDate: '2024-01-10', status: 'Em Uso' }
];

const INITIAL_INSPECTIONS: Inspection[] = [
    { id: 'INS-001', title: 'Checklist Empilhadeira #04', date: '2023-10-20', sector: 'Logística', responsible: 'Carlos Lima', compliance: 100, status: InspectionStatus.CONCLUIDO },
];

const INITIAL_EMPLOYEES: Employee[] = [
    { id: '1', name: 'Carlos Ferreira', roleId: 'role-1', roleName: 'Motorista de Caminhão', sector: 'Logística', asoStatus: ASOStatus.VALIDO, asoExpiration: '2024-05-10', trainingsValues: 100, status: 'Ativo', admissionDate: '2022-01-15' },
    { id: '2', name: 'Ana Souza', roleId: 'role-3', roleName: 'Analista Administrativo', sector: 'Escritório', asoStatus: ASOStatus.A_VENCER, asoExpiration: '2023-11-15', trainingsValues: 80, status: 'Ativo', admissionDate: '2023-03-10' },
    { id: '3', name: 'Roberto Diaz', roleId: 'role-4', roleName: 'Soldador', sector: 'Manutenção', asoStatus: ASOStatus.VENCIDO, asoExpiration: '2023-10-01', trainingsValues: 90, status: 'Ativo', admissionDate: '2021-05-20' },
];

const INITIAL_DRIVER_STATS: DriverStats[] = [
    { 
        employeeId: '1', 
        cnh: '12345678900', 
        cnhCategory: 'E', 
        cnhExpiration: '2025-06-20', 
        telemetryScore: 92, 
        authenticationRate: 98, 
        distanceDriven: 1250, 
        riskLevel: 'Baixo',
        history: [
            { month: 'Jun', score: 88 },
            { month: 'Jul', score: 90 },
            { month: 'Ago', score: 91 },
            { month: 'Set', score: 92 },
        ]
    },
    { 
        employeeId: '3', 
        cnh: '98765432100', 
        cnhCategory: 'B', 
        cnhExpiration: '2024-12-01', 
        telemetryScore: 65, 
        authenticationRate: 70, 
        distanceDriven: 450, 
        riskLevel: 'Alto',
        history: [
            { month: 'Jun', score: 75 },
            { month: 'Jul', score: 72 },
            { month: 'Ago', score: 68 },
            { month: 'Set', score: 65 },
        ]
    }
];

const INITIAL_ACTION_PLANS: ActionPlan[] = [
    { 
        id: 'AP-001', 
        origin: 'Acidente', 
        originId: 'AC-2023-001', 
        description: 'Instalar guarda-corpo no Armazém B', 
        responsible: 'Ricardo Mendes', 
        assignedTo: 'Manutenção', 
        deadline: '2023-11-01', 
        status: ActionPlanStatus.EM_ANDAMENTO, 
        priority: 'Alta',
        progress: 50,
        steps: [
            { id: 's1', description: 'Realizar cotação de material', responsible: 'Compras', deadline: '2023-10-20', status: 'Concluído' },
            { id: 's2', description: 'Instalação física', responsible: 'Manutenção', deadline: '2023-11-01', status: 'Pendente' }
        ],
        logs: [
            { id: 'l1', date: '2023-10-15T10:00:00', user: 'Ricardo Mendes', type: 'CREATION', message: 'Plano de ação criado automaticamente.' },
            { id: 'l2', date: '2023-10-20T14:00:00', user: 'Ricardo Mendes', type: 'STATUS_CHANGE', message: 'Etapa "Cotação" marcada como concluída.' }
        ]
    },
    { 
        id: 'AP-002', 
        origin: 'Inspeção', 
        originId: 'INS-002', 
        description: 'Recarregar Extintores Bloco A', 
        responsible: 'Ricardo Mendes', 
        assignedTo: 'Compras', 
        deadline: '2023-10-25', 
        status: ActionPlanStatus.PENDENTE, 
        priority: 'Média',
        progress: 0,
        steps: [
            { id: 's1', description: 'Coletar extintores vencidos', responsible: 'Assistente', deadline: '2023-10-22', status: 'Pendente' }
        ],
        logs: [
             { id: 'l1', date: '2023-10-20T09:00:00', user: 'Ricardo Mendes', type: 'CREATION', message: 'Plano de ação criado.' }
        ]
    },
];

const INITIAL_TASKS: OperationalTask[] = [
    { id: 'T-001', title: 'Ronda de Segurança - Bloco B', description: 'Verificar obstrução de saídas de emergência', assignedTo: UserRole.ASSISTENTE_OP, createdBy: 'Ricardo Mendes', dueDate: new Date().toISOString().split('T')[0], frequency: TaskFrequency.DIARIA, status: 'Pendente' }
];

const INITIAL_VEHICLES: Vehicle[] = [
    { id: 'v1', model: 'Fiat Fiorino', plate: 'ABC-1234', status: VehicleStatus.DISPONIVEL, mileage: 45000, lastMaintenance: '2023-08-15' },
    { id: 'v2', model: 'Renault Master', plate: 'XYZ-9876', status: VehicleStatus.EM_USO, mileage: 82000, lastMaintenance: '2023-09-10' },
    { id: 'v3', model: 'Toyota Hilux', plate: 'DEF-5678', status: VehicleStatus.MANUTENCAO, mileage: 120000, lastMaintenance: '2023-10-01' }
];

const INITIAL_TRAININGS: Training[] = [
    { id: 'TR-1', title: 'NR-35 Trabalho em Altura', description: 'Capacitação obrigatória para trabalhos acima de 2m.', validityMonths: 24, mandatory: true },
    { id: 'TR-2', title: 'NR-10 Básico', description: 'Segurança em Instalações e Serviços em Eletricidade.', validityMonths: 24, mandatory: true },
    { id: 'TR-3', title: 'Direção Defensiva', description: 'Técnicas para prevenção de acidentes no trânsito.', validityMonths: 12, mandatory: false },
    { id: 'TR-4', title: 'Integração de Segurança', description: 'Treinamento introdutório para novos colaboradores.', validityMonths: 0, mandatory: true },
];

const INITIAL_TRAINING_RECORDS: TrainingRecord[] = [
    { id: 'REC-1', employeeId: '1', employeeName: 'Carlos Ferreira', trainingId: 'TR-3', trainingTitle: 'Direção Defensiva', completionDate: '2023-01-15', expirationDate: '2024-01-15', status: 'A Vencer' },
    { id: 'REC-2', employeeId: '3', employeeName: 'Roberto Diaz', trainingId: 'TR-1', trainingTitle: 'NR-35 Trabalho em Altura', completionDate: '2021-08-10', expirationDate: '2023-08-10', status: 'Vencido' },
];

// Initial Permissions Matrix
const INITIAL_PERMISSIONS: Record<UserRole, ModuleType[]> = {
    [UserRole.SUPER_ADMIN]: Object.values(ModuleType),
    [UserRole.GESTOR_GERAL]: [
        ModuleType.DASHBOARD, ModuleType.ACTION_PLANS, ModuleType.SST_ACCIDENTS, 
        ModuleType.SST_INSPECTIONS, ModuleType.SST_EPI, ModuleType.TRAININGS,
        ModuleType.FLEET, ModuleType.RH, ModuleType.DOCUMENTS
    ],
    [UserRole.TECNICO_SEGURANCA]: [
        ModuleType.DASHBOARD, ModuleType.OPERATIONAL_DASHBOARD, ModuleType.ACTION_PLANS, 
        ModuleType.SST_ACCIDENTS, ModuleType.SST_INSPECTIONS, ModuleType.SST_EPI, 
        ModuleType.TRAININGS, ModuleType.FLEET, ModuleType.RH, ModuleType.DOCUMENTS
    ],
    [UserRole.ASSISTENTE_OP]: [
        ModuleType.OPERATIONAL_DASHBOARD, ModuleType.ACTION_PLANS, ModuleType.SST_ACCIDENTS, 
        ModuleType.SST_INSPECTIONS, ModuleType.SST_EPI, ModuleType.TRAININGS
    ],
    [UserRole.RH]: [
        ModuleType.DASHBOARD, ModuleType.RH, ModuleType.TRAININGS, ModuleType.FLEET, ModuleType.DOCUMENTS
    ]
};

interface DataContextType {
    accidents: Accident[];
    epis: EPIItem[];
    jobRoles: JobRole[];
    epiAssignments: EPIAssignment[];
    inspections: Inspection[];
    employees: Employee[];
    actionPlans: ActionPlan[];
    tasks: OperationalTask[];
    vehicles: Vehicle[];
    driverStats: DriverStats[];
    fleetEvents: FleetEvent[];
    notifications: Notification[];
    trainings: Training[];
    trainingRecords: TrainingRecord[];
    permissions: Record<UserRole, ModuleType[]>;
    systemAlerts: SystemAlert[];
    
    // Actions
    showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
    addAccident: (accident: Omit<Accident, 'id'>) => void;
    updateAccident: (id: string, updates: Partial<Accident>) => void;
    deleteAccident: (id: string) => void;
    addEPI: (epi: Omit<EPIItem, 'id'>) => void;
    updateEPIStock: (id: string, quantityChange: number) => void;
    assignEPI: (employeeId: string, epiId: string) => void;
    assignMultipleEPIs: (employeeId: string, epiIds: string[]) => void;
    returnEPI: (assignmentId: string) => void;
    addInspection: (inspection: Omit<Inspection, 'id'>) => void;
    addEmployee: (employee: Omit<Employee, 'id'>) => void;
    addJobRole: (role: Omit<JobRole, 'id'>) => void;
    terminateEmployee: (id: string) => void;
    addActionPlan: (plan: Omit<ActionPlan, 'id' | 'steps' | 'logs' | 'progress'>) => void;
    updateActionPlan: (id: string, updates: Partial<ActionPlan>) => void; // New
    extendActionPlanDeadline: (id: string, newDate: string, reason: string) => void; // New
    updateActionPlanSteps: (planId: string, steps: ActionPlanStep[]) => void; // New
    addActionPlanLog: (planId: string, message: string, type?: 'COMMENT') => void; // New
    addTask: (task: Omit<OperationalTask, 'id'>) => void;
    completeTask: (id: string) => void;
    addFleetEvent: (event: Omit<FleetEvent, 'id' | 'employeeName' | 'feedbackGiven'>) => void;
    registerFleetFeedback: (eventId: string, notes: string) => void;
    addTraining: (training: Omit<Training, 'id'>) => void;
    addTrainingRecord: (record: Omit<TrainingRecord, 'id' | 'employeeName' | 'trainingTitle' | 'expirationDate' | 'status'>) => void;
    updateDriverTelemetry: (employeeId: string, data: { score: number; distance: number }) => void;
    
    // Permission Management
    updatePermissions: (role: UserRole, modules: ModuleType[]) => void;
    checkAccess: (role: UserRole, module: ModuleType) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    
    const [accidents, setAccidents] = useState<Accident[]>(INITIAL_ACCIDENTS);
    const [epis, setEpis] = useState<EPIItem[]>(INITIAL_EPI);
    const [jobRoles, setJobRoles] = useState<JobRole[]>(INITIAL_ROLES);
    const [epiAssignments, setEpiAssignments] = useState<EPIAssignment[]>(INITIAL_ASSIGNMENTS);
    const [inspections, setInspections] = useState<Inspection[]>(INITIAL_INSPECTIONS);
    const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
    const [actionPlans, setActionPlans] = useState<ActionPlan[]>(INITIAL_ACTION_PLANS);
    const [tasks, setTasks] = useState<OperationalTask[]>(INITIAL_TASKS);
    const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
    const [driverStats, setDriverStats] = useState<DriverStats[]>(INITIAL_DRIVER_STATS);
    const [fleetEvents, setFleetEvents] = useState<FleetEvent[]>([]);
    const [trainings, setTrainings] = useState<Training[]>(INITIAL_TRAININGS);
    const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>(INITIAL_TRAINING_RECORDS);
    const [permissions, setPermissions] = useState<Record<UserRole, ModuleType[]>>(INITIAL_PERMISSIONS);
    const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);

    const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
        const id = Date.now().toString();
        setNotifications(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 4000);
    }, []);

    // SYSTEM ALERT GENERATOR
    useEffect(() => {
        const alerts: SystemAlert[] = [];
        const now = new Date();
        const warningThreshold = new Date();
        warningThreshold.setDate(now.getDate() + 30); // 30 days ahead

        // 1. Check ASO Status
        employees.forEach(emp => {
            if (emp.status !== 'Ativo') return;

            const asoDate = new Date(emp.asoExpiration);
            
            if (asoDate < now) {
                alerts.push({
                    id: `aso-crit-${emp.id}`,
                    type: 'CRITICAL',
                    module: 'RH',
                    title: 'ASO Vencido',
                    message: `O colaborador ${emp.name} está com exame médico vencido.`,
                    date: emp.asoExpiration
                });
            } else if (asoDate < warningThreshold) {
                alerts.push({
                    id: `aso-warn-${emp.id}`,
                    type: 'WARNING',
                    module: 'RH',
                    title: 'ASO a Vencer',
                    message: `Exame de ${emp.name} vence em breve (${new Date(emp.asoExpiration).toLocaleDateString()}).`,
                    date: emp.asoExpiration
                });
            }
        });

        // 2. Check Trainings
        trainingRecords.forEach(rec => {
            if (!rec.expirationDate) return;
            const expDate = new Date(rec.expirationDate);
            // Check if employee is still active
            const emp = employees.find(e => e.id === rec.employeeId);
            if (!emp || emp.status !== 'Ativo') return;

            if (expDate < now) {
                alerts.push({
                    id: `tr-crit-${rec.id}`,
                    type: 'CRITICAL',
                    module: 'TRAININGS',
                    title: 'Treinamento Vencido',
                    message: `${rec.employeeName}: ${rec.trainingTitle} expirou em ${new Date(rec.expirationDate).toLocaleDateString()}.`,
                    date: rec.expirationDate
                });
            } else if (expDate < warningThreshold) {
                alerts.push({
                    id: `tr-warn-${rec.id}`,
                    type: 'WARNING',
                    module: 'TRAININGS',
                    title: 'Reciclagem Necessária',
                    message: `${rec.employeeName}: ${rec.trainingTitle} vence em menos de 30 dias.`,
                    date: rec.expirationDate
                });
            }
        });

        // 3. Check EPI Stock
        epis.forEach(epi => {
            if (epi.stock < epi.minStock) {
                 alerts.push({
                    id: `epi-stock-${epi.id}`,
                    type: 'CRITICAL',
                    module: 'EPI',
                    title: 'Estoque Baixo',
                    message: `${epi.name} está abaixo do mínimo (${epi.stock} unidades).`,
                    date: new Date().toISOString()
                });
            }
        });

        setSystemAlerts(alerts);
    }, [employees, trainingRecords, epis]);

    const addAccident = (newAccident: Omit<Accident, 'id'>) => {
        const accident = { ...newAccident, id: `AC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}` };
        setAccidents(prev => [accident, ...prev]);
        showNotification('success', 'Acidente registrado com sucesso.');
        
        if (newAccident.severity === IncidentSeverity.GRAVE || newAccident.severity === IncidentSeverity.MODERADO) {
            addActionPlan({
                origin: 'Acidente',
                originId: accident.id,
                description: `Investigação e Tratativa: ${newAccident.description}`,
                responsible: 'Técnico Segurança',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: ActionPlanStatus.PENDENTE,
                priority: 'Alta'
            });
            showNotification('info', 'Plano de ação automático gerado.');
        }
    };

    const updateAccident = (id: string, updates: Partial<Accident>) => {
        setAccidents(prev => prev.map(acc => acc.id === id ? { ...acc, ...updates } : acc));
        showNotification('success', 'Acidente atualizado com sucesso.');
    };

    const deleteAccident = (id: string) => {
        setAccidents(prev => prev.filter(a => a.id !== id));
        showNotification('success', 'Registro de acidente removido.');
    }

    const addEPI = (epi: Omit<EPIItem, 'id'>) => {
        const newEPI = { ...epi, id: `EPI-${Date.now()}` };
        setEpis(prev => [...prev, newEPI]);
        showNotification('success', 'Novo EPI cadastrado com sucesso.');
    };

    const updateEPIStock = (id: string, quantityChange: number) => {
        setEpis(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, stock: Math.max(0, item.stock + quantityChange) };
            }
            return item;
        }));
    };

    const assignEPI = (employeeId: string, epiId: string) => {
        const emp = employees.find(e => e.id === employeeId);
        const epi = epis.find(e => e.id === epiId);
        
        if (emp && epi) {
            updateEPIStock(epiId, -1);
            const newAssignment: EPIAssignment = {
                id: `assign-${Date.now()}`,
                employeeId,
                employeeName: emp.name,
                epiId,
                epiName: epi.name,
                deliveryDate: new Date().toISOString().split('T')[0],
                expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
                status: 'Em Uso'
            };
            setEpiAssignments(prev => [newAssignment, ...prev]);
            showNotification('success', 'EPI entregue e estoque atualizado.');
        }
    };

    const assignMultipleEPIs = (employeeId: string, epiIds: string[]) => {
        const emp = employees.find(e => e.id === employeeId);
        if (!emp) return;

        const newAssignments: EPIAssignment[] = [];
        const stockUpdates: Record<string, number> = {};

        epiIds.forEach(epiId => {
            const epi = epis.find(e => e.id === epiId);
            if (epi && epi.stock > 0) {
                stockUpdates[epiId] = (stockUpdates[epiId] || 0) - 1;
                newAssignments.push({
                    id: `assign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    employeeId,
                    employeeName: emp.name,
                    epiId,
                    epiName: epi.name,
                    deliveryDate: new Date().toISOString().split('T')[0],
                    expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    status: 'Em Uso'
                });
            }
        });

        if (newAssignments.length > 0) {
            setEpis(prev => prev.map(item => {
                if (stockUpdates[item.id]) {
                    return { ...item, stock: Math.max(0, item.stock + stockUpdates[item.id]) };
                }
                return item;
            }));
            setEpiAssignments(prev => [...newAssignments, ...prev]);
            showNotification('success', `${newAssignments.length} EPIs entregues com sucesso.`);
        }
    };

    const returnEPI = (assignmentId: string) => {
        setEpiAssignments(prev => prev.map(a => {
            if (a.id === assignmentId) {
                return { ...a, status: 'Devolvido', returnDate: new Date().toISOString().split('T')[0] };
            }
            return a;
        }));
        showNotification('success', 'Devolução de EPI registrada.');
    };

    const addInspection = (newInsp: Omit<Inspection, 'id'>) => {
        const inspection = { ...newInsp, id: `INS-${Math.floor(Math.random() * 1000)}` };
        setInspections(prev => [inspection, ...prev]);
        showNotification('success', 'Inspeção registrada.');
    };

    const addEmployee = (newEmp: Omit<Employee, 'id'>) => {
        const emp = { ...newEmp, id: `EMP-${Date.now()}` };
        setEmployees(prev => [...prev, emp]);
        showNotification('success', 'Colaborador cadastrado.');
    };

    const addJobRole = (newRole: Omit<JobRole, 'id'>) => {
        const role = { ...newRole, id: `ROLE-${Date.now()}` };
        setJobRoles(prev => [...prev, role]);
        showNotification('success', 'Cargo criado.');
    };

    const terminateEmployee = (id: string) => {
        const emp = employees.find(e => e.id === id);
        if (!emp) return;

        // 1. Update Employee Status
        setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: 'Inativo' } : e));
        showNotification('info', `Colaborador ${emp.name} desligado.`);

        // 2. Check for active EPIs (Status 'Em Uso')
        const activeEPIs = epiAssignments.filter(a => a.employeeId === id && a.status === 'Em Uso');

        // 3. Generate Task if there are pending items
        if (activeEPIs.length > 0) {
            const itemList = activeEPIs.map(i => i.epiName).join(', ');
            addTask({
                title: `Recolher EPIs: ${emp.name}`,
                description: `Colaborador desligado. Pendências: ${itemList}. Recolher e dar baixa no sistema.`,
                assignedTo: UserRole.ASSISTENTE_OP,
                createdBy: 'Sistema RH',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                frequency: TaskFrequency.UNICA,
                status: 'Pendente',
                isSystemGenerated: true
            });
            showNotification('info', 'Tarefa de recolhimento de EPI gerada.');
        }
    };

    const addActionPlan = (plan: Omit<ActionPlan, 'id' | 'steps' | 'logs' | 'progress'>) => {
        const newPlan: ActionPlan = { 
            ...plan, 
            id: `AP-${Math.floor(Math.random() * 10000)}`,
            progress: 0,
            steps: [],
            logs: [{
                id: `log-${Date.now()}`,
                date: new Date().toISOString(),
                user: 'Sistema',
                type: 'CREATION',
                message: 'Plano de Ação criado.'
            }]
        };
        setActionPlans(prev => [newPlan, ...prev]);
        showNotification('success', 'Plano de ação criado.');
        
        if (plan.assignedTo === 'Assistente' || plan.assignedTo === 'ASSISTENTE_OP') {
            let taskDescription = `Executar plano de ação (ID: ${newPlan.id}). Prioridade: ${plan.priority}`;
            
            // Intelligent EPI Detection
            // Check if any registered EPI name is present in the action plan description
            const detectedEPIs = epis.filter(epi => 
                plan.description.toLowerCase().includes(epi.name.toLowerCase())
            );

            if (detectedEPIs.length > 0) {
                const epiList = detectedEPIs.map(e => e.name).join(', ');
                taskDescription += `\n\n[SUGESTÃO AUTOMÁTICA] O sistema identificou EPIs na descrição: ${epiList}. Verifique o estoque e prepare a entrega.`;
            } else if (plan.description.toLowerCase().includes('epi') || plan.description.toLowerCase().includes('equipamento')) {
                // Catch-all for generic "EPI" mentions without specific name
                taskDescription += `\n\n[SUGESTÃO AUTOMÁTICA] Possível necessidade de EPIs detectada na descrição. Verifique quais itens são necessários.`;
            }

            addTask({
                title: `Ação: ${plan.description}`,
                description: taskDescription,
                assignedTo: UserRole.ASSISTENTE_OP,
                createdBy: plan.responsible,
                dueDate: plan.deadline,
                frequency: TaskFrequency.UNICA,
                status: 'Pendente',
                isSystemGenerated: true
            });
        }
    };

    const updateActionPlan = (id: string, updates: Partial<ActionPlan>) => {
        setActionPlans(prev => prev.map(plan => 
            plan.id === id ? { ...plan, ...updates } : plan
        ));
    };

    const extendActionPlanDeadline = (id: string, newDate: string, reason: string) => {
        setActionPlans(prev => prev.map(plan => {
            if (plan.id === id) {
                const newLog: ActionPlanLog = {
                    id: `log-${Date.now()}`,
                    date: new Date().toISOString(),
                    user: 'Usuário', // Should use real user name context
                    type: 'EXTENSION',
                    message: `Prazo prorrogado de ${new Date(plan.deadline).toLocaleDateString()} para ${new Date(newDate).toLocaleDateString()}. Motivo: ${reason}`
                };
                return { 
                    ...plan, 
                    deadline: newDate, 
                    logs: [newLog, ...plan.logs],
                    status: ActionPlanStatus.EM_ANDAMENTO // Reset to active if it was late
                };
            }
            return plan;
        }));
        
        // Also update linked tasks deadlines
        setTasks(prev => prev.map(t => {
            if (t.linkedActionPlanId === id && t.status === 'Pendente') {
                return { ...t, dueDate: newDate };
            }
            return t;
        }));
        
        showNotification('info', 'Prazo do plano e tarefas vinculadas prorrogado.');
    };

    const updateActionPlanSteps = (planId: string, steps: ActionPlanStep[]) => {
        // 1. Update the Action Plan itself
        setActionPlans(prev => prev.map(plan => {
            if (plan.id === planId) {
                // Calculate new progress
                const total = steps.length;
                const completed = steps.filter(s => s.status === 'Concluído').length;
                const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
                
                // Add log only if progress changed or steps count changed
                const logs = [...plan.logs];
                if (progress !== plan.progress) {
                     logs.unshift({
                        id: `log-${Date.now()}`,
                        date: new Date().toISOString(),
                        user: 'Sistema',
                        type: 'STATUS_CHANGE',
                        message: `Progresso atualizado para ${progress}%.`
                    });
                }

                // Auto-complete plan if 100%
                let status = plan.status;
                if (progress === 100 && plan.status !== ActionPlanStatus.CONCLUIDO) {
                    status = ActionPlanStatus.CONCLUIDO;
                    logs.unshift({
                        id: `log-complete-${Date.now()}`,
                        date: new Date().toISOString(),
                        user: 'Sistema',
                        type: 'STATUS_CHANGE',
                        message: `Plano finalizado automaticamente (100% etapas concluídas).`
                    });
                }

                return { ...plan, steps, progress, logs, status };
            }
            return plan;
        }));

        // 2. Sync with Operational Tasks
        setTasks(prevTasks => {
            const newTasks = [...prevTasks];

            steps.forEach(step => {
                const existingTaskIndex = newTasks.findIndex(t => t.linkedStepId === step.id);

                if (existingTaskIndex > -1) {
                    // Update existing task status
                    newTasks[existingTaskIndex].status = step.status === 'Concluído' ? 'Concluído' : 'Pendente';
                } else {
                    // Create new task if it doesn't exist
                    newTasks.unshift({
                        id: `T-STEP-${step.id}`,
                        title: `Ação: ${step.description}`,
                        description: `Etapa do Plano de Ação #${planId}. Responsável: ${step.responsible}`,
                        assignedTo: UserRole.ASSISTENTE_OP, // Default assignment, logic could be improved to map responsible
                        createdBy: 'Sistema (Plano de Ação)',
                        dueDate: step.deadline,
                        frequency: TaskFrequency.UNICA,
                        status: step.status === 'Concluído' ? 'Concluído' : 'Pendente',
                        isSystemGenerated: true,
                        linkedActionPlanId: planId,
                        linkedStepId: step.id
                    });
                }
            });
            return newTasks;
        });
    };

    const addActionPlanLog = (planId: string, message: string, type: 'COMMENT' = 'COMMENT') => {
        setActionPlans(prev => prev.map(plan => {
            if (plan.id === planId) {
                return {
                    ...plan,
                    logs: [{
                        id: `log-${Date.now()}`,
                        date: new Date().toISOString(),
                        user: 'Usuário',
                        type,
                        message
                    }, ...plan.logs]
                };
            }
            return plan;
        }));
    };

    const addTask = (task: Omit<OperationalTask, 'id'>) => {
        const newTask = { ...task, id: `T-${Math.floor(Math.random() * 10000)}` };
        setTasks(prev => [newTask, ...prev]);
        showNotification('success', 'Tarefa atribuída.');
    };

    const completeTask = (id: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id === id) {
                // If it's a linked task, we should also update the Action Plan step status
                if (t.linkedStepId && t.linkedActionPlanId) {
                    // Trigger async update to Action Plans to avoid state collision loop, or handle it carefully
                    // For simplicity in this demo, we won't reverse-sync Task -> Plan here to avoid complexity,
                    // but usually you would update the plan step to 'Concluído' as well.
                }
                return { ...t, status: 'Concluído' };
            }
            return t;
        }));
        showNotification('success', 'Tarefa concluída!');
    };

    const addFleetEvent = (event: Omit<FleetEvent, 'id' | 'employeeName' | 'feedbackGiven'>) => {
        const emp = employees.find(e => e.id === event.employeeId);
        if (!emp) return;

        const newEvent: FleetEvent = {
            ...event,
            id: `fe-${Date.now()}`,
            employeeName: emp.name,
            feedbackGiven: false
        };

        setFleetEvents(prev => [newEvent, ...prev]);
        showNotification('success', 'Evento de frota registrado.');

        // Dynamic Update of Driver Stats
        setDriverStats(prev => prev.map(d => {
            if (d.employeeId === event.employeeId) {
                const updated = { ...d };
                
                // Keep the automatic penalty logic, but user can't manually set the % anymore
                if (event.type === FleetEventType.NO_AUTH) {
                    updated.authenticationRate = Math.max(0, updated.authenticationRate - 5);
                } else {
                    updated.telemetryScore = Math.max(0, updated.telemetryScore - event.pointsDeducted);
                }

                if (updated.telemetryScore < 60 || updated.authenticationRate < 80) updated.riskLevel = 'Alto';
                else if (updated.telemetryScore < 80) updated.riskLevel = 'Médio';
                else updated.riskLevel = 'Baixo';

                return updated;
            }
            return d;
        }));
    };

    const registerFleetFeedback = (eventId: string, notes: string) => {
        setFleetEvents(prev => prev.map(e => 
            e.id === eventId ? {
                ...e,
                feedbackGiven: true,
                feedbackDate: new Date().toISOString(),
                feedbackNotes: notes
            } : e
        ));
        showNotification('success', 'Feedback registrado com sucesso.');
    };

    const updateDriverTelemetry = (employeeId: string, data: { score: number; distance: number }) => {
        // Updated: Removed 'authRate' argument. Auth rate is solely event-driven now.
        setDriverStats(prev => {
            const index = prev.findIndex(d => d.employeeId === employeeId);
            let riskLevel: 'Baixo' | 'Médio' | 'Alto' = 'Baixo';
            
            // Re-calc risk based on new score + existing auth rate
            const existingAuthRate = index >= 0 ? prev[index].authenticationRate : 100;
            
            if (data.score < 60 || existingAuthRate < 80) riskLevel = 'Alto';
            else if (data.score < 80) riskLevel = 'Médio';

            if (index >= 0) {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    telemetryScore: data.score,
                    // authenticationRate is preserved, not overwritten
                    distanceDriven: data.distance,
                    riskLevel
                };
                return updated;
            } else {
                // Create new record for driver
                return [...prev, {
                    employeeId,
                    cnh: 'N/A', // Default placeholders
                    cnhCategory: 'B',
                    cnhExpiration: '2025-01-01',
                    telemetryScore: data.score,
                    authenticationRate: 100, // Starts at 100
                    distanceDriven: data.distance,
                    riskLevel,
                    history: []
                }];
            }
        });
        showNotification('success', 'Dados de telemetria atualizados.');
    };

    const addTraining = (newTraining: Omit<Training, 'id'>) => {
        const training = { ...newTraining, id: `TR-${Date.now()}` };
        setTrainings(prev => [...prev, training]);
        showNotification('success', 'Treinamento cadastrado.');
    };

    const addTrainingRecord = (record: Omit<TrainingRecord, 'id' | 'employeeName' | 'trainingTitle' | 'expirationDate' | 'status'>) => {
        const emp = employees.find(e => e.id === record.employeeId);
        const tr = trainings.find(t => t.id === record.trainingId);

        if (!emp || !tr) return;

        let expirationDate: string | null = null;
        if (tr.validityMonths > 0) {
            const date = new Date(record.completionDate);
            date.setMonth(date.getMonth() + tr.validityMonths);
            expirationDate = date.toISOString().split('T')[0];
        }

        const newRecord: TrainingRecord = {
            ...record,
            id: `REC-${Date.now()}`,
            employeeName: emp.name,
            trainingTitle: tr.title,
            expirationDate,
            status: 'Válido' // Logic handles status elsewhere if needed, but initially valid
        };

        setTrainingRecords(prev => [...prev, newRecord]);
        showNotification('success', 'Realização de treinamento registrada.');
    };

    const updatePermissions = (role: UserRole, modules: ModuleType[]) => {
        setPermissions(prev => ({
            ...prev,
            [role]: modules
        }));
        showNotification('success', `Permissões atualizadas para ${role}`);
    };

    const checkAccess = (role: UserRole, module: ModuleType) => {
        if (role === UserRole.SUPER_ADMIN) return true;
        const rolePermissions = permissions[role] || [];
        return rolePermissions.includes(module);
    };

    return (
        <DataContext.Provider value={{
            accidents, epis, jobRoles, epiAssignments, inspections, employees, actionPlans, tasks, vehicles, driverStats, fleetEvents, notifications,
            trainings, trainingRecords, permissions, systemAlerts,
            showNotification, addAccident, updateAccident, deleteAccident, addEPI, updateEPIStock, assignEPI, assignMultipleEPIs, returnEPI, addInspection, addEmployee, addJobRole, terminateEmployee, 
            addActionPlan, addTask, completeTask, addFleetEvent, registerFleetFeedback, addTraining, addTrainingRecord,
            updateActionPlan, extendActionPlanDeadline, updateActionPlanSteps, addActionPlanLog, updateDriverTelemetry,
            updatePermissions, checkAccess
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};