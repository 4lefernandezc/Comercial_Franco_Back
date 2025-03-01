-- Ejecútalo en tu base de datos para poblar las tablas con datos. 

-- Poblar la tabla roles (10)
INSERT INTO roles ("nombre", "descripcion") VALUES
('admin', 'Administrador del sistema'),
('vendedor', 'Usuario encargado de ventas'),
('inventario', 'Usuario encargado de gestionar inventarios'),
('cliente', 'Usuario cliente del sistema'),
('proveedor', 'Usuario proveedor'),
('gerente', 'Usuario encargado de supervisar el sistema'),
('analista', 'Usuario encargado de análisis de datos'),
('supervisor', 'Usuario supervisor'),
('tecnico', 'Usuario técnico'),
('auxiliar', 'Usuario auxiliar');

-- Poblar la tabla sucursales (10)
INSERT INTO sucursales ("nombre", "direccion", "telefono", "correo", "activo") VALUES
('Sucursal Central', 'Av. Principal 123', '123456789', 'central@sistema.com', true),
('Sucursal Norte', 'Calle Norte 456', '987654321', 'norte@sistema.com', true),
('Sucursal Sur', 'Calle Sur 789', '567123456', 'sur@sistema.com', true),
('Sucursal Este', 'Av. Este 101', '345678901', 'este@sistema.com', true),
('Sucursal Oeste', 'Calle Oeste 202', '234567890', 'oeste@sistema.com', true),
('Sucursal Centro', 'Plaza Centro 303', '678901234', 'centro@sistema.com', true),
('Sucursal Andina', 'Av. Andina 404', '890123456', 'andina@sistema.com', true),
('Sucursal Llanos', 'Calle Llanos 505', '901234567', 'llanos@sistema.com', true),
('Sucursal Valle', 'Av. Valle 606', '012345678', 'valle@sistema.com', true),
('Sucursal Montaña', 'Calle Montaña 707', '789012345', 'montaña@sistema.com', true);

-- Poblar la tabla usuarios (10)
INSERT INTO usuarios ("usuario", "nombre", "apellido", "correo", "telefono", "clave", "activo", "ultimo_login", "rol_id", "sucursal_id") VALUES
('jperez', 'Juan', 'Pérez', 'juan.perez@sistema.com', '555123456', 'password123', true, NOW(), 1, 1),
('mlopez', 'María', 'López', 'maria.lopez@sistema.com', '555987654', 'password123', true, NOW(), 2, 1),
('cmartinez', 'Carlos', 'Martínez', 'carlos.martinez@sistema.com', '555567123', 'password123', true, NOW(), 3, 2),
('agomez', 'Ana', 'Gómez', 'ana.gomez@sistema.com', '555345678', 'password123', true, NOW(), 2, 3),
('prodriguez', 'Pedro', 'Rodríguez', 'pedro.rodriguez@sistema.com', '555234567', 'password123', true, NOW(), 4, 4),
('lfernandez', 'Laura', 'Fernández', 'laura.fernandez@sistema.com', '555678901', 'password123', true, NOW(), 5, 5),
('lgarcia', 'Luis', 'García', 'luis.garcia@sistema.com', '555890123', 'password123', true, NOW(), 6, 6),
('shernandez', 'Sofía', 'Hernández', 'sofia.hernandez@sistema.com', '555901234', 'password123', true, NOW(), 7, 7),
('dtorres', 'Diego', 'Torres', 'diego.torres@sistema.com', '555012345', 'password123', true, NOW(), 8, 8),
('eramirez', 'Elena', 'Ramírez', 'elena.ramirez@sistema.com', '555789012', 'password123', true, NOW(), 9, 9);

-- Poblar la tabla categorias (10)
INSERT INTO categorias ("nombre", "descripcion", "activo") VALUES
('Electrónica', 'Productos electrónicos', true),
('Ropa', 'Ropa para todas las edades', true),
('Calzado', 'Zapatos y zapatillas', true),
('Hogar', 'Productos para el hogar', true),
('Juguetes', 'Juguetes para niños', true),
('Alimentos', 'Productos alimenticios', true),
('Bebidas', 'Bebidas y licores', true),
('Deportes', 'Artículos deportivos', true),
('Libros', 'Libros y revistas', true),
('Tecnología', 'Productos tecnológicos', true);

-- Poblar la tabla monedas (5)
INSERT INTO monedas ("codigo", "nombre", "simbolo", "es_principal", "tasa_cambio_base") VALUES
('USD', 'Dólar', '$', true, 6.96),
('EUR', 'Euro', '€', false, 7.85),
('JPY', 'Yen Japonés', '¥', false, 110.00),
('MXN', 'Peso Mexicano', '$', false, 20.00),
('BOB', 'Boliviano', 'Bs', false, 1);

-- Poblar la tabla tipos_unidades (5)
INSERT INTO tipos_unidades ("nombre", "abreviatura") VALUES
('Kilogramo', 'kg'),
('Litro', 'l'),
('Metro', 'm'),
('Unidad', 'u'),
('Caja', 'c');

-- Poblar la tabla cajas (5)
INSERT INTO cajas ("monto_inicial", "monto_final", "total_ingresos", "total_egresos", "fecha_apertura", "fecha_cierre", "estado", "usuario_apertura_id", "usuario_cierre_id", "sucursal_id") VALUES
(5000, 1000, 2000, 500, '2023-01-01', '2023-01-31', 'cerrada', 1, 2, 1),
(3000, 500, 1500, 300, '2023-02-01', '2023-02-28', 'cerrada', 2, 4, 3),
(4000, 800, 1800, 400, '2023-03-01', '2023-03-31', 'cerrada', 3, 6, 5),
(2000, 300, 1200, 200, '2023-04-01', '2023-04-30', 'cerrada', 4, 8, 7),
(3500, 700, 1700, 350, '2023-05-01', '2023-05-31', 'cerrada', 5, 10, 9);

-- Poblar la tabla clientes (10)
INSERT INTO clientes (tipo_documento, documento, nombre, apellido, direccion, telefono, correo, activo, link_whatsapp) VALUES
('CI', '12345678', 'Mario', 'Gutiérrez', 'Calle Falsa 123', '555123456', 'mario.gutierrez@cliente.com', true, 'https://wa.me/555123456'),
('CI', '87654321', 'Lucía', 'Ramírez', 'Av. Real 456', '555987654', 'lucia.ramirez@cliente.com', true, 'https://wa.me/555987654'),
('CI', '11223344', 'Alberto', 'Gómez', 'Calle Verde 789', '555567123', 'alberto.gomez@cliente.com', true, 'https://wa.me/555567123'),
('CI', '44332211', 'Carla', 'Rodríguez', 'Calle Azul 101', '555345678', 'carla.rodriguez@cliente.com', true, 'https://wa.me/555345678'),
('CI', '55667788', 'Fernando', 'Torres', 'Av. Roja 202', '555234567', 'fernando.torres@cliente.com', true, 'https://wa.me/555234567'),
('CI', '88776655', 'Patricia', 'López', 'Calle Amarilla 303', '555678901', 'patricia.lopez@cliente.com', true, 'https://wa.me/555678901'),
('CI', '99887766', 'Sergio', 'Fernández', 'Calle Negra 404', '555890123', 'sergio.fernandez@cliente.com', true, 'https://wa.me/555890123'),
('CI', '66554433', 'Mariana', 'García', 'Av. Blanca 505', '555901234', 'mariana.garcia@cliente.com', true, 'https://wa.me/555901234'),
('CI', '33221100', 'Gabriel', 'Hernández', 'Calle Gris 606', '555012345', 'gabriel.hernandez@cliente.com', true, 'https://wa.me/555012345'),
('CI', '00112233', 'Natalia', 'Ramírez', 'Av. Naranja 707', '555789012', 'natalia.ramirez@cliente.com', true, 'https://wa.me/555789012');

-- Poblar la tabla proveedores (10)
INSERT INTO proveedores ("nombre", "nit", "telefono", "direccion", "correo", "activo", "link_whatsapp", "id_moneda") VALUES
('Proveedor Central', '123456789', '555123456', 'Calle Central 123', 'central@proveedor.com', true, 'https://wa.me/555123456', 1),
('Proveedor Norte', '987654321', '555987654', 'Av. Norte 456', 'norte@proveedor.com', true, 'https://wa.me/555987654', 2),
('Proveedor Sur', '567123456', '555567123', 'Calle Sur 789', 'sur@proveedor.com', true, 'https://wa.me/555567123', 3),
('Proveedor Este', '345678901', '555345678', 'Av. Este 101', 'este@proveedor.com', true, 'https://wa.me/555345678', 4),
('Proveedor Oeste', '234567890', '555234567', 'Calle Oeste 202', 'oeste@proveedor.com', true, 'https://wa.me/555234567', 5),
('Proveedor Centro', '678901234', '555678901', 'Plaza Centro 303', 'centro@proveedor.com', true, 'https://wa.me/555678901', 1),
('Proveedor Andina', '890123456', '555890123', 'Av. Andina 404', 'andina@proveedor.com', true, 'https://wa.me/555890123', 2),
('Proveedor Llanos', '901234567', '555901234', 'Calle Llanos 505', 'llanos@proveedor.com', true, 'https://wa.me/555901234', 3),
('Proveedor Valle', '012345678', '555012345', 'Av. Valle 606', 'valle@proveedor.com', true, 'https://wa.me/555012345', 4),
('Proveedor Montaña', '789012345', '555789012', 'Calle Montaña 707', 'montaña@proveedor.com', true, 'https://wa.me/555789012', 5);

-- Poblar la tabla productos (10)
INSERT INTO productos ("codigo", "nombre", "presentacion", "dimensiones", "precio_compra", "precio_venta", "precio_agranel", "total_presentacion", "activo", "id_proveedor", "id_categoria") VALUES
('PROD001', 'Martillo', 'Caja', '30x10x5 cm', 5.00, 10.00, 9.00, 10, true, 1, 1),
('PROD002', 'Taladro', 'Caja', '40x20x10 cm', 50.00, 75.00, 70.00, 5, true, 2, 1),
('PROD003', 'Destornillador', 'Blister', '15x5x2 cm', 2.00, 5.00, 4.50, 20, true, 3, 1),
('PROD004', 'Llave Inglesa', 'Caja', '25x8x3 cm', 10.00, 20.00, 18.00, 10, true, 4, 2),
('PROD005', 'Sierra', 'Caja', '50x15x5 cm', 15.00, 30.00, 27.00, 5, true, 5, 3),
('PROD006', 'Alicate', 'Blister', '20x7x3 cm', 8.00, 15.00, 13.50, 10, true, 6, 2),
('PROD007', 'Cinta Métrica', 'Blister', '10x10x2 cm', 3.00, 7.00, 6.50, 15, true, 7, 5),
('PROD008', 'Nivel', 'Caja', '30x5x3 cm', 7.00, 12.00, 11.00, 10, true, 8, 7),
('PROD009', 'Serrucho', 'Caja', '45x10x5 cm', 12.00, 25.00, 22.50, 5, true, 9, 9),
('PROD010', 'Broca', 'Blister', '10x2x2 cm', 1.00, 3.00, 2.50, 30, true, 10, 8);

-- Poblar la tabla inventarios_sucursal (10)
INSERT INTO inventarios_sucursales ("stock_actual", "stock_minimo", "stock_maximo", "se_vende_fraccion", "tipo_unidad_id", "id_producto", "id_sucursal") VALUES
(10, 1, 20, false, 1, 1, 1),
(15, 2, 25, false, 2, 2, 2),
(30, 3, 50, true, 3, 3, 3),
(5, 1, 10, false, 4, 4, 4),
(8, 2, 15, false, 5, 5, 5),
(20, 5, 40, true, 1, 6, 6),
(25, 3, 50, false, 2, 7, 7),
(12, 1, 20, false, 3, 8, 8),
(18, 2, 30, true, 4, 9, 9),
(10, 1, 20, false, 5, 10, 10);

-- Poblar la tabla movimientos_inventarios (10)
INSERT INTO movimientos_inventarios ("documento_referencia", "tipo_movimiento", "cantidad", "motivo", "estado", "id_usuario", "id_sucursal_destino", "id_producto", "id_sucursal") VALUES
('ENT1', 'entrada', 10, 'Compra', 'completado', 1, NULL, 1, 1),
('SAL1', 'salida', 5, 'Venta', 'completado', 2, NULL, 2, 2),
('AJU1', 'ajuste', 2, 'Ajuste', 'completado', 3, NULL, 3, 3),
('TRANS1', 'transferencia', 3, 'Reubicación', 'completado', 4, 5, 4, 4),
('ENT2', 'entrada', 4, 'Compra', 'completado', 5, NULL, 5, 5),
('SAL2', 'salida', 7, 'Venta', 'completado', 6, NULL, 6, 6),
('AJU2', 'ajuste', 1, 'Ajuste', 'completado', 7, NULL, 7, 7),
('ENT3', 'entrada', 20, 'Compra', 'completado', 8, NULL, 8, 8),
('SAL3', 'salida', 3, 'Venta', 'completado', 9, NULL, 9, 9),
('ENT4', 'entrada', 5, 'Compra', 'completado', 10, NULL, 10, 10);

-- Poblar la tabla ventas (10)
INSERT INTO ventas ("numero_documento", "subtotal", "total_venta", "metodo_pago", "estado", "monto_pagado", "cambio", "fecha_anulacion", "usuario_id", "sucursal_id", "cliente_id", "caja_id", "nombre_cliente", "documento_cliente") VALUES
('VEN-1', 100.00, 110.00, 'efectivo', 'completada', 110.00, 0.00, NULL, 1, 1, 1, 1, NULL, NULL),
('VEN-2', 200.00, 220.00, 'tarjeta', 'completada', 220.00, 0.00, NULL, 2, 2, 2, 2, NULL, NULL),
('VEN-3', 150.00, 165.00, 'transferencia', 'pendiente', 165.00, 0.00, NULL, 3, 3, 3, 3, NULL, NULL),
('VEN-4', 50.00, 55.00, 'efectivo', 'anulada', 55.00, 0.00, NOW(), 4, 4, 4, 4, NULL, NULL),
('VEN-5', 300.00, 330.00, 'tarjeta', 'completada', 330.00, 0.00, NULL, 5, 5, 5, 5, NULL, NULL),
('VEN-6', 400.00, 440.00, 'transferencia', 'completada', 440.00, 0.00, NULL, 6, 6, 6, 1, NULL, NULL),
('VEN-7', 250.00, 275.00, 'efectivo', 'completada', 275.00, 0.00, NULL, 7, 7, 7, 2, NULL, NULL),
('VEN-8', 350.00, 385.00, 'tarjeta', 'pendiente', 385.00, 0.00, NULL, 8, 8, 8, 3, NULL, NULL),
('VEN-9', 120.00, 132.00, 'efectivo', 'completada', 132.00, 0.00, NULL, 9, 9, 9, 4, NULL, NULL),
('VEN-10', 80.00, 88.00, 'transferencia', 'completada', 88.00, 0.00, NULL, 10, 10, 10, 5, NULL, NULL);

-- Poblar la tabla detalle_ventas (10)
INSERT INTO detalle_ventas ("cantidad", "precio_unitario", "descuento", "subtotal", "venta_id", "producto_id") VALUES
(1, 100.00, 0.00, 100.00, 1, 1),
(2, 110.00, 0.00, 220.00, 2, 2),
(3, 50.00, 0.00, 150.00, 3, 3),
(4, 55.00, 5.00, 200.00, 4, 4),
(5, 60.00, 0.00, 300.00, 5, 5),
(6, 70.00, 10.00, 400.00, 6, 6),
(7, 80.00, 0.00, 560.00, 7, 7),
(8, 90.00, 0.00, 720.00, 8, 8),
(9, 100.00, 0.00, 900.00, 9, 9),
(10, 110.00, 0.00, 1100.00, 10, 10);

-- Poblar la tabla compras (10)
INSERT INTO compras ("numero_documento", "subtotal", "total_compra", "metodo_pago", "estado", "usuarioId", "sucursalId", "proveedorId", "cajaId") VALUES
('COMP-1', 200.00, 220.00, 'efectivo', 'completada', 1, 1, 1, 1),
('COMP-2', 150.00, 165.00, 'tarjeta', 'pendiente', 2, 2, 2, 2),
('COMP-3', 400.00, 440.00, 'transferencia', 'completada', 3, 3, 3, 3),
('COMP-4', 300.00, 330.00, 'efectivo', 'completada', 4, 4, 4, 4),
('COMP-5', 100.00, 110.00, 'tarjeta', 'pendiente', 5, 5, 5, 5),
('COMP-6', 500.00, 550.00, 'transferencia', 'completada', 6, 6, 6, 1),
('COMP-7', 600.00, 660.00, 'efectivo', 'anulada', 7, 7, 7, 2),
('COMP-8', 250.00, 275.00, 'tarjeta', 'completada', 8, 8, 8, 3),
('COMP-9', 320.00, 352.00, 'transferencia', 'completada', 9, 9, 9, 4),
('COMP-10', 450.00, 495.00, 'efectivo', 'completada', 10, 10, 10, 5);

-- Poblar la tabla detalle_compras (10)
INSERT INTO detalle_compras ("cantidad", "precio_unitario", "descuento", "subtotal", "compra_id", "producto_id") VALUES
(1, 20.00, 0.00, 20.00, 1, 1),
(2, 15.00, 0.00, 30.00, 2, 2),
(3, 10.00, 0.00, 30.00, 3, 3),
(4, 25.00, 0.00, 100.00, 4, 4),
(5, 10.00, 0.00, 50.00, 5, 5),
(6, 50.00, 0.00, 300.00, 6, 6),
(7, 60.00, 0.00, 420.00, 7, 7),
(8, 30.00, 0.00, 240.00, 8, 8),
(9, 35.00, 0.00, 315.00, 9, 9),
(10, 45.00, 0.00, 450.00, 10, 10);

-- Poblar la tabla cotizaciones (10)
INSERT INTO cotizaciones ("numero_documento", "subtotal", "total_venta", "metodo_pago", "estado", "usuario_id", "sucursal_id", "cliente_id", "nombre_cliente", "documento_cliente") VALUES
('COT-1', 100.00, 110.00, 'efectivo', 'completada', 1, 1, 1, NULL, NULL),
('COT-2', 200.00, 220.00, 'tarjeta', 'pendiente', 2, 2, 2, NULL, NULL),
('COT-3', 150.00, 165.00, 'transferencia', 'completada', 3, 3, 3, NULL, NULL),
('COT-4', 50.00, 55.00, 'efectivo', 'pendiente', 4, 4, 4, NULL, NULL),
('COT-5', 300.00, 330.00, 'tarjeta', 'completada', 5, 5, 5, NULL, NULL),
('COT-6', 400.00, 440.00, 'transferencia', 'completada', 6, 6, 6, NULL, NULL),
('COT-7', 250.00, 275.00, 'efectivo', 'completada', 7, 7, 7, NULL, NULL),
('COT-8', 350.00, 385.00, 'tarjeta', 'pendiente', 8, 8, 8, NULL, NULL),
('COT-9', 120.00, 132.00, 'efectivo', 'completada', 9, 9, 9, NULL, NULL),
('COT-10', 80.00, 88.00, 'transferencia', 'completada', 10, 10, 10, NULL, NULL);

-- Poblar la tabla detalle_cotizaciones (10)
INSERT INTO detalle_cotizaciones ("cantidad", "precio_unitario", "descuento", "subtotal", "cotizacion_id", "producto_id") VALUES
(1, 100.00, 0.00, 100.00, 1, 1),
(2, 110.00, 0.00, 220.00, 2, 2),
(3, 50.00, 0.00, 150.00, 3, 3),
(4, 55.00, 5.00, 200.00, 4, 4),
(5, 60.00, 0.00, 300.00, 5, 5),
(6, 70.00, 10.00, 400.00, 6, 6),
(7, 80.00, 0.00, 560.00, 7, 7),
(8, 90.00, 0.00, 720.00, 8, 8),
(9, 100.00, 0.00, 900.00, 9, 9),
(10, 110.00, 0.00, 1100.00, 10, 10);

