import React, { useState } from "react";
import { login } from "../api/dummyJson";
import { LoginPayload } from "../types";

interface AuthViewProps {
  onLoginSuccess: (payload: LoginPayload) => void;
}

interface FieldErrors {
  username?: string;
  password?: string;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("kminchelle");
  const [password, setPassword] = useState("0lelplR");
  const [remember, setRemember] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    if (!username.trim()) {
      errors.username = "Введите логин";
    }

    if (!password.trim()) {
      errors.password = "Введите пароль";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await login({ username: username.trim(), password: password.trim() });
      onLoginSuccess({ response, remember });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось выполнить вход";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearUsername = () => {
    setUsername("");
    setFieldErrors((prev) => ({ ...prev, username: undefined }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <main className="auth-page__wrapper">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-card__logo">
          <img src="img/auth-logo.svg" alt="Логотип" />
        </div>

        <header className="auth-card__header">
          <h1 id="auth-title" className="auth-card__title">
            Добро пожаловать!
          </h1>
          <p className="auth-card__subtitle">Пожалуйста, авторизируйтесь</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="login">
              Логин
            </label>
            <div className="auth-input">
              <span className="auth-input__icon">
                <img src="img/auth-user-icon.svg" alt="" aria-hidden="true" />
              </span>
              <input
                id="login"
                name="login"
                type="text"
                className="auth-input__control"
                placeholder="Введите логин"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                aria-invalid={fieldErrors.username ? "true" : "false"}
                aria-describedby={fieldErrors.username ? "login-error" : undefined}
              />
              {username && (
                <button
                  className="auth-input__clear"
                  type="button"
                  onClick={handleClearUsername}
                  aria-label="Очистить логин"
                >
                  <img src="img/auth-clear.svg" alt="" aria-hidden="true" />
                </button>
              )}
            </div>
            {fieldErrors.username && (
              <p id="login-error" className="auth-form__error">
                {fieldErrors.username}
              </p>
            )}
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="password">
              Пароль
            </label>
            <div className="auth-input">
              <span className="auth-input__icon">
                <img src="img/auth-lock.svg" alt="" aria-hidden="true" />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="auth-input__control"
                placeholder="Введите пароль"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={fieldErrors.password ? "true" : "false"}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
              />
              <button
                className="auth-input__visibility"
                type="button"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                <img src="img/auth-eye-off.svg" alt="" aria-hidden="true" />
              </button>
            </div>
            {fieldErrors.password && (
              <p id="password-error" className="auth-form__error">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <label className="auth-remember">
            <input
              type="checkbox"
              className="auth-remember__checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            <span className="auth-remember__box">
              <img src="img/auth-checkbox.svg" alt="" aria-hidden="true" />
            </span>
            <span className="auth-remember__label">Запомнить данные</span>
          </label>

          {apiError && <p className="auth-form__error auth-form__error--global">{apiError}</p>}

          <button type="submit" className="auth-submit" disabled={isSubmitting}>
            {isSubmitting ? "Входим..." : "Войти"}
          </button>

          <div className="auth-or">
            <span className="auth-or__line">
              <img src="img/auth-divider.svg" alt="" aria-hidden="true" />
            </span>
            <span className="auth-or__label">или</span>
            <span className="auth-or__line">
              <img src="img/auth-divider.svg" alt="" aria-hidden="true" />
            </span>
          </div>
        </form>

        <p className="auth-footer">
          <span>Нет аккаунта? </span>
          <a href="#" className="auth-footer__link">
            Создать
          </a>
        </p>
      </section>
    </main>
  );
};

