import { IAuthForm } from "./IAuthForm";

export interface IRegisterForm extends IAuthForm {
    confirmPassword: string;
}
