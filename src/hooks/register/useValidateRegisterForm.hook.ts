// hooks/register/useValidateRegisterForm.hook.ts
import type {
  DeepRequired,
  FieldErrorsImpl,
  UseFormHandleSubmit,
  UseFormRegisterReturn,
} from "react-hook-form";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export interface IRegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  emailVerified: boolean;
}

export default (): {
  nameRegister: UseFormRegisterReturn<'fullName'>
  emailRegister: UseFormRegisterReturn<"email">;
  passwordRegister: UseFormRegisterReturn<"password">;
  confirmPasswordRegister: UseFormRegisterReturn<"confirmPassword">;
  handleSubmit: UseFormHandleSubmit<IRegisterRequest>;
  errors: FieldErrorsImpl<DeepRequired<IRegisterRequest>>;
  watch: (field?: string) => any;
} => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<IRegisterRequest>({ mode: "all" });

  const password = watch("password");

  const nameRegister = register("fullName", {
    required: "Tên là bắt buộc",
    validate: (value) => {
      const trimmed = (value || "").trim();

      if (!trimmed) {
        return "Tên là bắt buộc";
      }

      if (trimmed.length < 2) {
        return "Tên phải có ít nhất 2 ký tự";
      }

      if (trimmed.length > 100) {
        return "Tên không được quá 100 ký tự";
      }

      return true;
    },
  });

  const emailRegister = register("email", {
    required: t("errorMessages.required", { field: t("email") }),
    pattern: {
      value: /^\S+@\S+\.\S+$/i,
      message: t("errorMessages.email"),
    },
  });

  const passwordRegister = register("password", {
    required: t("errorMessages.required", { field: t("password") }),
    validate: (value) => {
      const noSpaces = (value || "").replace(/\s/g, "");

      if (!noSpaces) {
        return t("errorMessages.required", { field: t("password") });
      }

      if (noSpaces.length < 8) {
        return "Mật khẩu phải có ít nhất 8 ký tự";
      }

      const strongPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

      if (!strongPattern.test(noSpaces)) {
        return "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt";
      }

      return true;
    },
  });

  const confirmPasswordRegister = register("confirmPassword", {
    required: "Xác nhận mật khẩu là bắt buộc",
    validate: (value) => {
      const noSpaces = (value || "").replace(/\s/g, "");
      const passwordNoSpaces = (password || "").replace(/\s/g, "");

      if (!noSpaces) {
        return "Xác nhận mật khẩu là bắt buộc";
      }

      if (noSpaces !== passwordNoSpaces) {
        return "Mật khẩu xác nhận không khớp";
      }

      return true;
    },
  });

  return {
    nameRegister,
    emailRegister,
    passwordRegister,
    confirmPasswordRegister,
    handleSubmit,
    errors,
    watch,
  };
};
