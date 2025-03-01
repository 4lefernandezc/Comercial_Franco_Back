-- Ejecuta para limpiar la base de datos.

-- Deshabilitar restricciones de claves foráneas temporalmente
SET session_replication_role = 'replica';

-- Eliminar tablas en el orden adecuado
DROP TABLE IF EXISTS cajas CASCADE;
DROP TABLE IF EXISTS detalle_compras CASCADE;
DROP TABLE IF EXISTS compras CASCADE;
DROP TABLE IF EXISTS detalle_ventas CASCADE;
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS cotizaciones CASCADE;
DROP TABLE IF EXISTS detalle_cotizaciones CASCADE;
DROP TABLE IF EXISTS movimientos_inventarios CASCADE;
DROP TABLE IF EXISTS tipos_unidades CASCADE;
DROP TABLE IF EXISTS inventarios_sucursales CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS monedas CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS sucursales CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Restaurar las restricciones de claves foráneas
SET session_replication_role = 'origin';
