import { auth } from "@clerk/nextjs/server";

export default async function TestAuthServer() {
  const { userId, sessionClaims } = await auth();

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">
        Test Auth Servidor
      </h2>

      {!userId ? (
        <p>No autenticado</p>
      ) : (
        <>
          <p>Autenticado</p>

          <p>
            <strong>User ID:</strong> {userId}
          </p>

          <p>
            <strong>Role:</strong>{" "}
            {String(sessionClaims?.role)}
          </p>
        </>
      )}
    </div>
  );
}