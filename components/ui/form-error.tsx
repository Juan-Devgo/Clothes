export default function FormError({ errors }: { errors: string[] | undefined}) {
  if (!errors) return null;

  return errors.map((err, index) => (
    <div key={index} className="text-sm text-red-800 mt-1">
      {err}
    </div>
  ));
}
