import type {
  DeepRequired,
  FieldErrorsImpl,
  UseFormHandleSubmit,
  UseFormRegisterReturn,
} from "react-hook-form";
import { useForm } from "react-hook-form";

export interface IChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default (): {
  oldPasswordRegister: UseFormRegisterReturn<"oldPassword">;
  newPasswordRegister: UseFormRegisterReturn<"newPassword">;
  confirmNewPasswordRegister: UseFormRegisterReturn<"confirmNewPassword">;
  handleSubmit: UseFormHandleSubmit<IChangePasswordRequest>;
  errors: FieldErrorsImpl<DeepRequired<IChangePasswordRequest>>;
  watch: (field?: string) => any;
  reset: () => void;
} => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<IChangePasswordRequest>({ mode: "all" });

  const newPassword = watch("newPassword");

  const oldPasswordRegister = register("oldPassword", {
    required: "Mật khẩu cũ là bắt buộc",
    minLength: {
      value: 1,
      message: "Mật khẩu cũ không được để trống",
    },
  });

  const newPasswordRegister = register("newPassword", {
    required: "Mật khẩu mới là bắt buộc",
    minLength: {
      value: 8,
      message: "Mật khẩu mới phải có ít nhất 8 ký tự",
    },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      message:
        "Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
    },
    validate: (value) => {
      const oldPassword = watch("oldPassword");
      if (value === oldPassword) {
        return "Mật khẩu mới phải khác mật khẩu cũ";
      }
      return true;
    },
  });

  const confirmNewPasswordRegister = register("confirmNewPassword", {
    required: "Xác nhận mật khẩu mới là bắt buộc",
    validate: (value) => {
      if (value !== newPassword) {
        return "Mật khẩu xác nhận không khớp";
      }
      return true;
    },
  });

  return {
    oldPasswordRegister,
    newPasswordRegister,
    confirmNewPasswordRegister,
    handleSubmit,
    errors,
    watch,
    reset,
  };
};
