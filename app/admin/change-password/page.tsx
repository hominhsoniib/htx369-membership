import { ChangePasswordForm } from "@/features/auth/change-password-form";

export default function ChangePasswordPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">🔑 Đổi Mật Khẩu Tài Khoản</h1>
        <p className="text-xs text-gray-500 mt-1">
          Thay đổi mật khẩu đăng nhập cá nhân của bạn để bảo mật tài khoản tốt hơn.
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
