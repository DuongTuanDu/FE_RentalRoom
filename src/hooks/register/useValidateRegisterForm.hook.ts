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
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  emailVerified: boolean;
}

export default (): {
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

  const emailRegister = register("email", {
    required: t("errorMessages.required", { field: t("email") }),
    pattern: {
      value: /^\S+@\S+\.\S+$/i,
      message: t("errorMessages.email"),
    },
  });

  const passwordRegister = register("password", {
    required: t("errorMessages.required", { field: t("password") }),
    minLength: {
      value: 8,
      message: "Mật khẩu phải có ít nhất 8 ký tự",
    },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      message:
        "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
    },
  });

  const confirmPasswordRegister = register("confirmPassword", {
    required: "Xác nhận mật khẩu là bắt buộc",
    validate: (value) => {
      if (value !== password) {
        return "Mật khẩu xác nhận không khớp";
      }
      return true;
    },
  });

  return {
    emailRegister,
    passwordRegister,
    confirmPasswordRegister,
    handleSubmit,
    errors,
    watch,
  };
};
