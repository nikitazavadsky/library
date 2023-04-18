export default function ErrorMessage({ error }: { error?: string }) {
  return (
    <>
      {error && (
        <div className="alert alert-error mt-2 rounded p-1">
          <div className="flex-1">
            <span>{error}</span>
          </div>
        </div>
      )}
    </>
  );
}
