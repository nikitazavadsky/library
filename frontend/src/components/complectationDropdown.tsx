import { type ItemComplectation } from "@/schemas/itemSchema";

export default function ComplectationDropdown({
  value = 0,
  itemComplectations,
  setIndex,
  setId,
  children,
}: {
  value?: ItemComplectation["id"];
  itemComplectations: ItemComplectation[];
  setIndex: (index: number) => void;
  setId?: (id: number) => void;
  children?: React.ReactNode;
}) {
  if (itemComplectations.length > 1) {
    return (
      <>
        {children}
        <select
          className="select-primary select w-full"
          onChange={(event) => {
            setIndex(
              itemComplectations.findIndex(
                (obj) => obj.id === Number(event.target.value)
              )
            );
            if (setId) setId(Number(event.target.value));
          }}
          value={value}
        >
          {Object.entries(itemComplectations).map(([key, value]) => (
            <option value={value.id} key={key}>
              {value.model} - {value.price} BYN
            </option>
          ))}
        </select>
      </>
    );
  }

  return <></>;
}
