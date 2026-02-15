import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";

const rawApiUrl = API_URL || 'http://localhost:5055';
const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;


// --- KONFIGURASI ---
const USE_DUMMY_MODE = false;
const rawApiUrl = API_URL || 'http://localhost:5055';
const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

interface SignInFormProps {
  onLogin?: () => void;
}

export default function SignInForm({ onLogin }: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (USE_DUMMY_MODE) {
      setTimeout(() => {
        setIsLoading(false);
        if (username && password) {
          const dummyUser = { id: "dummy", name: username, username };
          login("dummy_token_login", dummyUser);
          if (onLogin) onLogin();
          navigate("/dashboard/region");
        } else {
          setError("Username dan Password wajib diisi");
        }
      }, 1000);
      return;
    }

    try {
      // Membersihkan trailing slash agar tidak terjadi double slash //
      const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);
        if (onLogin) onLogin();
        navigate("/dashboard/region");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Gagal menghubungi server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Kembali
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-8 sm:mb-10 text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
              MASUK
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Silahkan masuk sesuai username dan password yang terdaftar
            </p>
          </div>

          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Username <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded text-center border border-red-100">{error}</p>}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Ingat saya
                    </span>
                  </div>
                  {/* Lupa password disembunyikan sesuai permintaan membatasi akses */}
                </div>
                <div>
                  <Button className="w-full py-3.5 text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5" size="md" disabled={isLoading}>
                    {isLoading ? "Memproses..." : "Masuk"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-8 text-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Akses terbatas untuk Administrator PLN.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}