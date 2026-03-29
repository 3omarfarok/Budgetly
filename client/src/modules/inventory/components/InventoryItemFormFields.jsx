import { Input, Select } from "../../../shared/components";
import { CATEGORY_OPTIONS } from "../constants";

function FieldError({ id, message }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} role="alert" aria-live="assertive" className="mt-1.5 text-xs text-ios-error">
      {message}
    </p>
  );
}

export default function InventoryItemFormFields({
  idPrefix,
  values,
  onChange,
  includeQuantity = false,
  errors = {},
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <Input
          id={`${idPrefix}-name`}
          label="اسم الصنف"
          placeholder="مثلاً: سائل تنظيف"
          value={values.name}
          onChange={(event) => onChange("name", event.target.value)}
          error={errors.name || undefined}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${idPrefix}-name-error` : undefined}
          required
        />
        <FieldError id={`${idPrefix}-name-error`} message={errors.name} />
      </div>

      <div>
        <Select
          id={`${idPrefix}-category`}
          label="التصنيف"
          value={values.category}
          onChange={(event) => onChange("category", event.target.value)}
          error={errors.category || undefined}
          aria-invalid={Boolean(errors.category)}
        >
          {CATEGORY_OPTIONS.filter((option) => option.value !== "all").map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {includeQuantity ? (
        <div>
          <Input
            id={`${idPrefix}-quantity`}
            label="الكمية الحالية"
            type="number"
            min="0"
            placeholder="0"
            value={values.quantity}
            onChange={(event) => onChange("quantity", event.target.value)}
            error={errors.quantity || undefined}
            aria-invalid={Boolean(errors.quantity)}
            aria-describedby={errors.quantity ? `${idPrefix}-quantity-error` : undefined}
            required
          />
          <FieldError id={`${idPrefix}-quantity-error`} message={errors.quantity} />
        </div>
      ) : null}

      <div>
        <Input
          id={`${idPrefix}-unit`}
          label="وحدة القياس"
          placeholder="مثلاً: عبوة، زجاجة، قطعة"
          value={values.unit}
          onChange={(event) => onChange("unit", event.target.value)}
          error={errors.unit || undefined}
          aria-invalid={Boolean(errors.unit)}
          aria-describedby={errors.unit ? `${idPrefix}-unit-error` : undefined}
          required
        />
        <FieldError id={`${idPrefix}-unit-error`} message={errors.unit} />
      </div>

      <div className={includeQuantity ? "md:col-span-2" : ""}>
        <Input
          id={`${idPrefix}-threshold`}
          label="حد التنبيه"
          type="number"
          min="0"
          placeholder="ابدأ التنبيه لما الكمية توصل للحد ده"
          value={values.lowStockThreshold}
          onChange={(event) => onChange("lowStockThreshold", event.target.value)}
          error={errors.lowStockThreshold || undefined}
          aria-invalid={Boolean(errors.lowStockThreshold)}
          aria-describedby={
            errors.lowStockThreshold ? `${idPrefix}-threshold-error` : undefined
          }
          required
        />
        <FieldError id={`${idPrefix}-threshold-error`} message={errors.lowStockThreshold} />
      </div>
    </div>
  );
}
