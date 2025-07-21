-- CreateTable
CREATE TABLE "filiales" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "filiales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "hora_inicio" VARCHAR(5) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'activo',
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dias_semana" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(20) NOT NULL,

    CONSTRAINT "dias_semana_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programa_dias" (
    "id" SERIAL NOT NULL,
    "programa_id" INTEGER NOT NULL,
    "dia_semana_id" INTEGER NOT NULL,

    CONSTRAINT "programa_dias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filial_programa" (
    "id" SERIAL NOT NULL,
    "filial_id" INTEGER NOT NULL,
    "programa_id" INTEGER NOT NULL,

    CONSTRAINT "filial_programa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_transmision" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(20) NOT NULL,

    CONSTRAINT "estados_transmision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "targets" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,

    CONSTRAINT "targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reportes" (
    "id" SERIAL NOT NULL,
    "filial_id" INTEGER NOT NULL,
    "programa_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "estado_id" INTEGER NOT NULL,
    "hora" VARCHAR(5),
    "hora_tt" VARCHAR(5),
    "target_id" INTEGER,
    "motivo" TEXT,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reportes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dias_semana_nombre_key" ON "dias_semana"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "programa_dias_programa_id_dia_semana_id_key" ON "programa_dias"("programa_id", "dia_semana_id");

-- CreateIndex
CREATE UNIQUE INDEX "filial_programa_filial_id_programa_id_key" ON "filial_programa"("filial_id", "programa_id");

-- CreateIndex
CREATE UNIQUE INDEX "estados_transmision_nombre_key" ON "estados_transmision"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "targets_codigo_key" ON "targets"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "reportes_filial_id_programa_id_fecha_key" ON "reportes"("filial_id", "programa_id", "fecha");

-- AddForeignKey
ALTER TABLE "programa_dias" ADD CONSTRAINT "programa_dias_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programa_dias" ADD CONSTRAINT "programa_dias_dia_semana_id_fkey" FOREIGN KEY ("dia_semana_id") REFERENCES "dias_semana"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filial_programa" ADD CONSTRAINT "filial_programa_filial_id_fkey" FOREIGN KEY ("filial_id") REFERENCES "filiales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filial_programa" ADD CONSTRAINT "filial_programa_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_filial_id_fkey" FOREIGN KEY ("filial_id") REFERENCES "filiales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "estados_transmision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "targets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
