import React, { useEffect, useMemo, useState } from "react";
import { fetchProducts, searchProducts } from "../api/dummyJson";
import { Product, SortField, SortState } from "../types";

interface ProductsViewProps {
  token: string;
  onLogout: () => void;
}

type ToastKind = "success" | "error";

interface ToastState {
  message: string;
  kind: ToastKind;
}

const formatPrice = (value: number): string => {
  return value.toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

const initialSort: SortState = {
  field: "name",
  direction: "asc"
};

export const ProductsView: React.FC<ProductsViewProps> = ({ token }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [baseProducts, setBaseProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sort, setSort] = useState<SortState>(initialSort);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await fetchProducts(token);
        if (!cancelled) {
          setProducts(data);
          setBaseProducts(data);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Не удалось загрузить товары";
          setLoadError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setProducts(baseProducts);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        const data = await searchProducts(token, trimmed);
        if (!cancelled) {
          setProducts(data);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Не удалось выполнить поиск товаров";
          setToast({ message, kind: "error" });
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery, token, baseProducts]);

  const onAddProduct = (input: { name: string; vendor: string; sku: string; price: number }) => {
    const newProduct: Product = {
      id: Date.now(),
      name: input.name,
      category: "Пользовательский товар",
      vendor: input.vendor,
      sku: input.sku,
      rating: 5,
      price: input.price,
      isLocal: true
    };

    setProducts((prev) => [newProduct, ...prev]);
    setBaseProducts((prev) => [newProduct, ...prev]);
    setIsAddOpen(false);
    setToast({ message: "Товар успешно добавлен", kind: "success" });
  };

  const toggleSort = (field: SortField) => {
    setSort((prev) => {
      if (prev.field === field) {
        return {
          field,
          direction: prev.direction === "asc" ? "desc" : "asc"
        };
      }
      return { field, direction: "asc" };
    });
  };

  const sortedProducts = useMemo(() => {
    const copy = [...products];

    copy.sort((a, b) => {
      const directionFactor = sort.direction === "asc" ? 1 : -1;

      switch (sort.field) {
        case "name":
          return a.name.localeCompare(b.name) * directionFactor;
        case "vendor":
          return a.vendor.localeCompare(b.vendor) * directionFactor;
        case "sku":
          return a.sku.localeCompare(b.sku) * directionFactor;
        case "rating":
          return (a.rating - b.rating) * directionFactor;
        case "price":
          return (a.price - b.price) * directionFactor;
        default:
          return 0;
      }
    });

    return copy;
  }, [products, sort]);

  const isProgressVisible = isLoading || isSearching;

  const renderSortIndicator = (field: SortField) => {
    if (sort.field !== field) {
      return null;
    }

    return (
      <span className="products-table__sort-indicator" aria-hidden="true">
        {sort.direction === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  return (
    <main className="products-layout">
      <header className="products-nav">
        <h1 className="products-nav__title">Товары</h1>
        <div className="products-search">
          <span className="products-search__icon">
            <img src="img/products-search.svg" alt="" aria-hidden="true" />
          </span>
          <input
            className="products-search__input"
            type="search"
            placeholder="Найти"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </header>

      <section className="products-content" aria-labelledby="products-title">
        <header className="products-header">
          <h2 id="products-title" className="products-header__title">
            Все позиции
          </h2>
          <div className="products-header__actions">
            <button
              className="icon-button"
              type="button"
              aria-label="Обновить"
              onClick={() => {
                setSearchQuery("");
                setProducts(baseProducts);
              }}
            >
              <img src="img/products-refresh.svg" alt="" aria-hidden="true" />
            </button>
            <button
              className="primary-button"
              type="button"
              onClick={() => setIsAddOpen(true)}
            >
              <span className="primary-button__icon">
                <img src="img/products-plus.svg" alt="" aria-hidden="true" />
              </span>
              <span>Добавить</span>
            </button>
          </div>
        </header>

        {isProgressVisible && (
          <div className="products-progress" aria-hidden="true">
            <div className="products-progress__bar" />
          </div>
        )}

        {loadError && (
          <p className="products-error" role="alert">
            {loadError}
          </p>
        )}

        <div className="products-table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th scope="col">
                  <div className="products-table__name-cell">
                    <span className="checkbox" aria-hidden="true" />
                    <button
                      type="button"
                      className="products-table__head-button"
                      onClick={() => toggleSort("name")}
                    >
                      <span>Наименование</span>
                      {renderSortIndicator("name")}
                    </button>
                  </div>
                </th>
                <th scope="col">
                  <button
                    type="button"
                    className="products-table__head-button products-table__head-button--center"
                    onClick={() => toggleSort("vendor")}
                  >
                    <span>Вендор</span>
                    {renderSortIndicator("vendor")}
                  </button>
                </th>
                <th scope="col">
                  <button
                    type="button"
                    className="products-table__head-button products-table__head-button--center"
                    onClick={() => toggleSort("sku")}
                  >
                    <span>Артикул</span>
                    {renderSortIndicator("sku")}
                  </button>
                </th>
                <th scope="col">
                  <button
                    type="button"
                    className="products-table__head-button products-table__head-button--center"
                    onClick={() => toggleSort("rating")}
                  >
                    <span>Оценка</span>
                    {renderSortIndicator("rating")}
                  </button>
                </th>
                <th scope="col">
                  <button
                    type="button"
                    className="products-table__head-button products-table__head-button--center"
                    onClick={() => toggleSort("price")}
                  >
                    <span>Цена, ₽</span>
                    {renderSortIndicator("price")}
                  </button>
                </th>
                <th scope="col" aria-label="Действия" />
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => {
                const isLowRating = product.rating < 3;
                const ratingText = product.rating.toFixed(1);

                return (
                  <tr key={product.id} className="products-table__row-group">
                    <td className="products-table__row">
                      <div className="products-table__name-cell">
                        <span className="checkbox" aria-hidden="true" />
                        <span className="products-table__photo" aria-hidden="true" />
                        <div className="products-table__name-text">
                          <span className="products-table__name-main">{product.name}</span>
                          <span className="products-table__name-sub">{product.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="products-table__vendor">{product.vendor}</td>
                    <td className="products-table__sku">{product.sku}</td>
                    <td className="products-table__rating">
                      <span
                        className={
                          isLowRating
                            ? "products-table__rating-value products-table__rating-value--low"
                            : "products-table__rating-value"
                        }
                      >
                        {ratingText}
                      </span>
                      <span>/5</span>
                    </td>
                    <td className="products-table__price">
                      <span className="products-table__price-main">
                        {formatPrice(product.price)}
                      </span>
                      <span className="products-table__price-fraction">,00</span>
                    </td>
                    <td>
                      <div className="products-table__actions">
                        <button
                          className="products-table__plus"
                          type="button"
                          aria-label="Добавить товар"
                        >
                          <img
                            src="img/products-row-plus.svg"
                            alt=""
                            aria-hidden="true"
                          />
                        </button>
                        <span className="products-table__dots" aria-hidden="true">
                          <img src="img/products-dots-plus.svg" alt="" />
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <footer className="products-footer">
          <p className="products-footer__info">
            <span>Показано </span>
            <strong>{sortedProducts.length}</strong>
          </p>
        </footer>
      </section>

      {isAddOpen && (
        <AddProductModal
          onSubmit={onAddProduct}
          onClose={() => setIsAddOpen(false)}
        />
      )}

      {toast && (
        <div
          className={`products-toast products-toast--${toast.kind}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </main>
  );
};

interface AddProductModalProps {
  onSubmit: (input: { name: string; vendor: string; sku: string; price: number }) => void;
  onClose: () => void;
}

interface AddFormState {
  name: string;
  vendor: string;
  sku: string;
  price: string;
}

interface AddFormErrors {
  name?: string;
  vendor?: string;
  sku?: string;
  price?: string;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onSubmit, onClose }) => {
  const [values, setValues] = useState<AddFormState>({
    name: "",
    vendor: "",
    sku: "",
    price: ""
  });
  const [errors, setErrors] = useState<AddFormErrors>({});

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: keyof AddFormState
  ) => {
    const next = event.target.value;
    setValues((prev) => ({ ...prev, [field]: next }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const nextErrors: AddFormErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = "Введите наименование";
    }
    if (!values.vendor.trim()) {
      nextErrors.vendor = "Введите вендор";
    }
    if (!values.sku.trim()) {
      nextErrors.sku = "Введите артикул";
    }
    if (!values.price.trim()) {
      nextErrors.price = "Введите цену";
    } else {
      const numericPrice = Number(values.price.replace(/\s+/g, "").replace(",", "."));
      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        nextErrors.price = "Введите корректную цену";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    const numericPrice = Number(values.price.replace(/\s+/g, "").replace(",", "."));
    onSubmit({
      name: values.name.trim(),
      vendor: values.vendor.trim(),
      sku: values.sku.trim(),
      price: numericPrice
    });
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <header className="modal__header">
          <h3 className="modal__title">Добавить товар</h3>
          <button
            type="button"
            className="modal__close"
            aria-label="Закрыть"
            onClick={onClose}
          >
            ×
          </button>
        </header>
        <form className="modal__form" onSubmit={handleSubmit} noValidate>
          <div className="modal__field">
            <label className="modal__label" htmlFor="add-name">
              Наименование
            </label>
            <input
              id="add-name"
              className="modal__input"
              type="text"
              value={values.name}
              onChange={(event) => handleChange(event, "name")}
            />
            {errors.name && <p className="modal__error">{errors.name}</p>}
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="add-vendor">
              Вендор
            </label>
            <input
              id="add-vendor"
              className="modal__input"
              type="text"
              value={values.vendor}
              onChange={(event) => handleChange(event, "vendor")}
            />
            {errors.vendor && <p className="modal__error">{errors.vendor}</p>}
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="add-sku">
              Артикул
            </label>
            <input
              id="add-sku"
              className="modal__input"
              type="text"
              value={values.sku}
              onChange={(event) => handleChange(event, "sku")}
            />
            {errors.sku && <p className="modal__error">{errors.sku}</p>}
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="add-price">
              Цена, ₽
            </label>
            <input
              id="add-price"
              className="modal__input"
              type="text"
              inputMode="decimal"
              value={values.price}
              onChange={(event) => handleChange(event, "price")}
            />
            {errors.price && <p className="modal__error">{errors.price}</p>}
          </div>

          <footer className="modal__footer">
            <button type="button" className="modal__button modal__button--secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="modal__button modal__button--primary">
              Добавить
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

