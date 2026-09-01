import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-muted">
        404
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-muted">
        That route does not exist in the trade desk.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Back to blotter
      </Link>
    </div>
  );
}
