-- CreateEnum
CREATE TYPE "EstadoModeracion" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "Resena" (
    "id" SERIAL NOT NULL,
    "idReserva" INTEGER NOT NULL,
    "idEmisor" TEXT NOT NULL,
    "calificacionGeneral" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resena_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResenaVehiculo" (
    "id" INTEGER NOT NULL,
    "idVehiculo" INTEGER NOT NULL,
    "calificacionLimpieza" INTEGER NOT NULL,
    "calificacionEstado" INTEGER NOT NULL,
    "calificacionComodidad" INTEGER NOT NULL,

    CONSTRAINT "ResenaVehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResenaPropietario" (
    "id" INTEGER NOT NULL,
    "idPropietario" INTEGER NOT NULL,
    "calificacionComunicacion" INTEGER NOT NULL,
    "calificacionPuntualidad" INTEGER NOT NULL,

    CONSTRAINT "ResenaPropietario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResenaAlquilador" (
    "id" INTEGER NOT NULL,
    "idAlquilador" INTEGER NOT NULL,
    "calificacionComunicacion" INTEGER NOT NULL,
    "calificacionPuntualidad" INTEGER NOT NULL,
    "calificacionDevolucion" INTEGER NOT NULL,

    CONSTRAINT "ResenaAlquilador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Moderacion" (
    "id" SERIAL NOT NULL,
    "idResena" INTEGER NOT NULL,
    "idModerador" TEXT NOT NULL,
    "estado" "EstadoModeracion" NOT NULL,
    "motivo" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Moderacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Respuesta" (
    "id" SERIAL NOT NULL,
    "idResena" INTEGER NOT NULL,
    "idAutor" TEXT NOT NULL,
    "comentario" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Respuesta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Respuesta_idResena_key" ON "Respuesta"("idResena");

-- AddForeignKey
ALTER TABLE "ResenaVehiculo" ADD CONSTRAINT "ResenaVehiculo_id_fkey" FOREIGN KEY ("id") REFERENCES "Resena"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResenaPropietario" ADD CONSTRAINT "ResenaPropietario_id_fkey" FOREIGN KEY ("id") REFERENCES "Resena"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResenaAlquilador" ADD CONSTRAINT "ResenaAlquilador_id_fkey" FOREIGN KEY ("id") REFERENCES "Resena"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moderacion" ADD CONSTRAINT "Moderacion_idResena_fkey" FOREIGN KEY ("idResena") REFERENCES "Resena"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Respuesta" ADD CONSTRAINT "Respuesta_idResena_fkey" FOREIGN KEY ("idResena") REFERENCES "Resena"("id") ON DELETE CASCADE ON UPDATE CASCADE;
