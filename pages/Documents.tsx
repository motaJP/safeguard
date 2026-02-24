import React from 'react';
import { Folder, FileText, MoreVertical, Download, UploadCloud } from 'lucide-react';

const FOLDERS = [
    { name: 'PGR - Programa de Gerenciamento de Riscos', files: 12, size: '45 MB' },
    { name: 'PCMSO - Controle Médico', files: 8, size: '22 MB' },
    { name: 'LTCAT - Laudos Técnicos', files: 5, size: '150 MB' },
    { name: 'Treinamentos e Listas de Presença', files: 45, size: '1.2 GB' },
    { name: 'Procedimentos Operacionais (POPs)', files: 20, size: '50 MB' },
];

const Documents: React.FC = () => {
    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Gestão Eletrônica de Documentos</h2>
                <button className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 text-sm font-medium">
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Upload Arquivo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {FOLDERS.map((folder, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-500 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start">
                            <Folder className="w-10 h-10 text-emerald-500 fill-emerald-50" />
                            <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                        <h3 className="font-bold text-gray-800 mt-4 text-sm">{folder.name}</h3>
                        <div className="mt-2 flex items-center text-xs text-gray-500 space-x-2">
                            <span>{folder.files} arquivos</span>
                            <span>•</span>
                            <span>{folder.size}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-4">Arquivos Recentes</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-red-50 rounded flex items-center justify-center mr-3">
                                    <FileText className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">PGR_Versao_Final_2023.pdf</p>
                                    <p className="text-xs text-gray-500">Adicionado por Ricardo Mendes em 10/10/2023</p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-emerald-600">
                                <Download className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Documents;