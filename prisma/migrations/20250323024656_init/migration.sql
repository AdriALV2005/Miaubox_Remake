-- CreateTable
CREATE TABLE `licencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `servicio_id` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `correo` VARCHAR(191) NOT NULL,
    `contraseña` VARCHAR(191) NOT NULL,
    `inicio` DATETIME(0) NOT NULL,
    `fin` DATETIME(0) NOT NULL,

    INDEX `servicio_id`(`servicio_id`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `plataforma` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL,
    `precio_vender` DECIMAL(10, 2) NOT NULL,
    `precio_comprar` DECIMAL(10, 2) NOT NULL,
    `num_proveedor` VARCHAR(191) NOT NULL,
    `empresa_proveedor` VARCHAR(191) NOT NULL,
    `fecha_inicio` DATETIME(3) NOT NULL,
    `fecha_fin` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `telefono` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL,
    `observacion` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ingreso` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `licencia_id` INTEGER NOT NULL,
    `detalles` VARCHAR(191) NOT NULL,
    `monto_ingreso` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `egreso` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `servicio_id` INTEGER NOT NULL,
    `detalles` VARCHAR(191) NOT NULL,
    `monto_egreso` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `licencia` ADD CONSTRAINT `licencia_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuario`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `licencia` ADD CONSTRAINT `licencia_ibfk_2` FOREIGN KEY (`servicio_id`) REFERENCES `servicio`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ingreso` ADD CONSTRAINT `ingreso_ibfk_1` FOREIGN KEY (`licencia_id`) REFERENCES `licencia`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `egreso` ADD CONSTRAINT `egreso_ibfk_1` FOREIGN KEY (`servicio_id`) REFERENCES `servicio`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
