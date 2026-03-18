import { useEffect, useState } from "react";
import Header from "../components/Header";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface UserData {
    nome: string;
    email: string;
    id?: string;
}

export default function Perfil() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token")?.replace(/"/g, "");

            if (!token) {
                toast.error("Sessão expirada. Faça login novamente.");
                navigate("/");
                return;
            }

            try {
                const response = await fetch("http://127.0.0.1:5000/me", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    setUser(data.User);
                } else {
                    toast.error(data.error || "Erro ao carregar perfil");
                    if (response.status === 401) navigate("/");
                }
            } catch (err) {
                console.error("Erro de rede:", err);
                toast.error("Erro ao conectar com o servidor");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    return (
        <>
            <Toaster />
            <div className="w-screen h-screen font-pressStart flex flex-col bg-primaryWhite">
                <Header />
                <div className="flex flex-1 mt-16">

                    {/* LADO ESQUERDO */}
                    <div className="w-1/2 h-full flex flex-col justify-center items-center text-textBlack bg-lightGreen p-8 shadow-lg">
                        <div className="bg-primaryWhite p-8 rounded-2xl shadow-md w-full max-w-md border-4 border-vibratingBlue">
                            <h1 className="text-2xl text-vibratingBlue font-bold mb-8 text-center">
                                Perfil
                            </h1>

                            <div className="space-y-6">
                                {loading ? (
                                    <p className="text-center animate-pulse">Buscando dados...</p>
                                ) : (
                                    <>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">NOME:</p>
                                            <p className="text-lg break-words">{user?.nome}</p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">E-MAIL:</p>
                                            <p className="text-lg break-words">{user?.email}</p>
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                // TODO: criar página de editar perfil
                                                onClick={() => navigate("/EditarPerfil")}
                                                className="w-full bg-vibratingBlue text-primaryWhite py-2 rounded-lg text-xs hover:bg-blue-700 transition"
                                            >
                                                Editar Perfil
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* LADO DIREITO */}
                    <div className="w-1/2 h-full flex flex-col justify-center items-center text-textBlack bg-primaryWhite p-8 shadow-lg">
                        <h1 className="text-4xl font-bold mb-8">Estatísticas</h1>
                        <p className="text-gray-400 text-xs mb-4">Dados vindos do servidor</p>
                    </div>
                </div>
            </div>
        </>
    );
}