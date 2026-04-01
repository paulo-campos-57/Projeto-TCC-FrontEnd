import { useEffect, useState } from "react";
import Header from "../../components/Header";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Pencil, Save, X } from "lucide-react";

interface UserData {
    nome: string;
    email: string;
    id?: string;
}

export default function Perfil() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [editNome, setEditNome] = useState("");
    const [editEmail, setEditEmail] = useState("");

    const navigate = useNavigate();

    const fetchUserData = async () => {
        const token = localStorage.getItem("token")?.replace(/"/g, "");
        if (!token) { navigate("/"); return; }

        try {
            const response = await fetch("http://127.0.0.1:5000/user/me", {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setUser(data.User);
                setEditNome(data.User.nome);
                setEditEmail(data.User.email);
            }
        } catch (err) {
            toast.error("Erro ao conectar com o servidor");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUserData(); }, []);

    const handleSave = async () => {
        const token = localStorage.getItem("token")?.replace(/"/g, "");
        const loadingToast = toast.loading("Salvando alterações...");

        try {
            const response = await fetch("http://127.0.0.1:5000/user/update_me", {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ nome: editNome, email: editEmail })
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.User);
                localStorage.setItem("user", JSON.stringify(data.User));
                setIsEditing(false);
                toast.success("Perfil atualizado!", { id: loadingToast });
            } else {
                toast.error(data.error || "Erro ao salvar", { id: loadingToast });
            }
        } catch (err) {
            toast.error("Erro de rede", { id: loadingToast });
        }
    };

    const handleDelete = async () => {
        if (!user?.id) {
            toast.error("ID do usuário não carregado.");
            return;
        }

        const confirmDelete = window.confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível.");

        if (!confirmDelete) return;

        const token = localStorage.getItem("token")?.replace(/"/g, "");
        const loadingToast = toast.loading("Excluindo conta...");

        try {
            const response = await fetch(`http://127.0.0.1:5000/user/delete/${user?.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                toast.success("Conta excluída com sucesso.", { id: loadingToast });

                localStorage.clear();

                setTimeout(() => navigate("/"), 2000);
            } else {
                const data = await response.json();
                toast.error(data.error || "Erro ao excluir conta", { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error("Erro de rede ao tentar excluir", { id: loadingToast });
        }
    };

    return (
        <>
            <Toaster />
            <div className="w-screen h-screen font-pressStart flex flex-col bg-primaryWhite overflow-hidden">
                <Header />
                <div className="flex flex-1 pt-16">

                    <div className="w-1/2 h-full flex flex-col justify-center items-center text-textBlack bg-lightGreen p-8">

                        <div className="bg-primaryWhite p-8 w-full max-w-md border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] relative transition-all">

                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="absolute top-4 right-4 text-black hover:-translate-y-1 hover:text-vibratingBlue active:translate-y-0 transition-all"
                            >
                                {isEditing ? <X size={24} className="text-crimsonRed" /> : <Pencil size={24} />}
                            </button>

                            <h1 className="text-xl md:text-2xl text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] mb-8 text-center">
                                Perfil
                            </h1>

                            <div className="space-y-6">
                                {loading ? (
                                    <p className="text-center animate-pulse text-[10px] md:text-xs">Buscando...</p>
                                ) : (
                                    <>
                                        <div>
                                            <p className="text-[10px] md:text-xs text-gray-700 mb-2">NOME:</p>
                                            {isEditing ? (
                                                <input
                                                    className="w-full p-3 border-4 border-black bg-white focus:bg-gray-100 focus:outline-none text-[10px] md:text-xs transition-colors"
                                                    value={editNome}
                                                    onChange={(e) => setEditNome(e.target.value)}
                                                />
                                            ) : (
                                                <p className="text-xs md:text-sm break-words border-b-2 border-black border-dashed pb-1">
                                                    {user?.nome}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-[10px] md:text-xs text-gray-700 mb-2">E-MAIL:</p>
                                            {isEditing ? (
                                                <input
                                                    className="w-full p-3 border-4 border-black bg-white focus:bg-gray-100 focus:outline-none text-[10px] md:text-xs transition-colors"
                                                    value={editEmail}
                                                    onChange={(e) => setEditEmail(e.target.value)}
                                                />
                                            ) : (
                                                <p className="text-xs md:text-sm break-words border-b-2 border-black border-dashed pb-1">
                                                    {user?.email}
                                                </p>
                                            )}
                                        </div>

                                        <div className="pt-4">
                                            {!isEditing && (
                                                <button
                                                    onClick={handleDelete}
                                                    className="w-full bg-crimsonRed text-primaryWhite py-3 text-[10px] md:text-xs border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 hover:bg-red-600 active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all"
                                                >
                                                    <X size={16} />
                                                    EXCLUIR CONTA
                                                </button>
                                            )}

                                            {isEditing && (
                                                <button
                                                    onClick={handleSave}
                                                    className="w-full bg-vibratingBlue text-primaryWhite py-3 text-[10px] md:text-xs border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 hover:bg-blue-600 active:translate-y-1 active:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all"
                                                >
                                                    <Save size={16} /> SALVAR ALTERAÇÕES
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="w-1/2 h-full flex flex-col justify-center items-center text-textBlack bg-primaryWhite p-8 border-l-4 border-black">
                        <h1 className="text-xl md:text-3xl text-vibratingBlue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] mb-8 text-center">
                            Estatísticas
                        </h1>
                        <div className="w-3/4 h-1/2 border-4 border-black border-dashed flex justify-center items-center text-gray-400 text-[10px] md:text-xs text-center p-4">
                            MÓDULO DE ESTATÍSTICAS
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}