"use client";

import {
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

export default function TestAuthClient() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded)
    return <div>Cargando...</div>;

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">
        Test Auth Cliente
      </h2>

      {!isSignedIn ? (
        <>
          <p>No autenticado</p>

          <SignInButton>
            <span className="bg-black text-white px-4 py-2 rounded cursor-pointer">
              Iniciar sesión
            </span>
          </SignInButton>
        </>
      ) : (
        <>
          <p>Autenticado</p>

          <p>
            <strong>ID:</strong> {user.id}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {user.primaryEmailAddress?.emailAddress}
          </p>

          <p>
            <strong>Nombre:</strong> {user.firstName}
          </p>

          <div className="mt-4">
            <UserButton />
          </div>
        </>
      )}
    </div>
  );
}