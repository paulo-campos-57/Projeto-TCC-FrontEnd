import { useEffect, useState } from "react";
import Header from "../components/Header";
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
            const response = await fetch("http://127.0.0.1:5000/me", {
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
            const response = await fetch("http://127.0.0.1:5000/update_me", {
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
        const confirmDelete = window.confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível.");

        if (!confirmDelete) return;

        const token = localStorage.getItem("token")?.replace(/"/g, "");
        const loadingToast = toast.loading("Excluindo conta...");

        try {
            const response = await fetch(`http://127.0.0.1:5000/delete/${user?.id}`, {
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
            <div className="w-screen h-screen font-pressStart flex flex-col bg-primaryWhite">
                <Header />
                <div className="flex flex-1 mt-16">
                    <div className="w-1/2 h-full flex flex-col justify-center items-center text-textBlack bg-lightGreen p-8 shadow-lg">
                        {/* LADO DIREITO */}
                        <div className="bg-primaryWhite p-8 rounded-2xl shadow-md w-full max-w-md border-4 border-vibratingBlue relative">

                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="absolute top-4 right-4 text-vibratingBlue hover:scale-110 transition"
                            >
                                {isEditing ? <X size={24} className="text-crimsonRed" /> : <Pencil size={24} />}
                            </button>

                            <h1 className="text-2xl text-vibratingBlue font-bold mb-8 text-center">Perfil</h1>

                            <div className="space-y-6">
                                {loading ? (
                                    <p className="text-center animate-pulse">Buscando...</p>
                                ) : (
                                    <>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-2">NOME:</p>
                                            {isEditing ? (
                                                <input
                                                    className="w-full p-2 border-2 border-goldenYellow rounded bg-white text-sm"
                                                    value={editNome}
                                                    onChange={(e) => setEditNome(e.target.value)}
                                                />
                                            ) : (
                                                <p className="text-lg break-words">{user?.nome}</p>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 mb-2">E-MAIL:</p>
                                            {isEditing ? (
                                                <input
                                                    className="w-full p-2 border-2 border-goldenYellow rounded bg-white text-sm"
                                                    value={editEmail}
                                                    onChange={(e) => setEditEmail(e.target.value)}
                                                />
                                            ) : (
                                                <p className="text-lg break-words">{user?.email}</p>
                                            )}
                                        </div>

                                        {!isEditing && (
                                            <button
                                                onClick={handleDelete}
                                                className="w-full bg-crimsonRed text-primaryWhite py-3 rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-red-700 transition"
                                            >
                                                <X size={16} />
                                                Excluir usuário
                                            </button>
                                        )}

                                        {isEditing && (
                                            <button
                                                onClick={handleSave}
                                                className="w-full bg-vibratingBlue text-primaryWhite py-3 rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition mt-4"
                                            >
                                                <Save size={16} /> SALVAR ALTERAÇÕES
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* LADO DIREITO */}
                    <div className="w-1/2 h-full flex flex-col justify-center items-center text-textBlack bg-primaryWhite p-8 shadow-lg">
                        <h1 className="text-4xl font-bold mb-8">Estatísticas</h1>
                    </div>
                </div>
            </div>
        </>
    );
}