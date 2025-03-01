-- Ejecútalo en tu base de datos para crear la estructura inicial. 

-- Crear tabla roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre character varying(50) NOT NULL,
    descripcion character varying(250),
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_modificacion timestamp without time zone DEFAULT now() NOT NULL
);

-- Crear tabla sucursales
CREATE TABLE sucursales (
    id SERIAL PRIMARY KEY,
    nombre character varying(150) NOT NULL,
    telefono character varying(15) NOT NULL,
    direccion character varying(255) NOT NULL,
    correo character varying(255),
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_modificacion timestamp without time zone DEFAULT now() NOT NULL
);

-- Crear tabla usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    usuario character varying(20) NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    correo character varying(255),
    telefono character varying(20),
    clave character varying(255) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    ultimo_login date NOT NULL,
    rol_id integer NOT NULL REFERENCES roles(id),
    sucursal_id integer NOT NULL REFERENCES sucursales(id),
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_modificacion timestamp without time zone DEFAULT now() NOT NULL
);

-- Crear tabla categorias
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre character varying(50) NOT NULL,
    descripcion character varying(250),
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_modificacion timestamp without time zone DEFAULT now() NOT NULL
);

-- Crear tabla monedas
CREATE TABLE monedas (
    id SERIAL PRIMARY KEY,
    codigo character varying(3) NOT NULL,
    nombre character varying(50) NOT NULL,
    simbolo character varying(5) NOT NULL,
    es_principal boolean DEFAULT false NOT NULL,
    tasa_cambio_base numeric(10,2),
    fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    fecha_modificacion timestamp with time zone DEFAULT now() NOT NULL
);

-- Crear tabla tipos de unidades
CREATE TABLE tipos_unidades (
    id SERIAL PRIMARY KEY,
    nombre character varying(50) NOT NULL,
    abreviatura character varying(10) NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_modificacion timestamp without time zone DEFAULT now() NOT NULL
);

-- Crear tabla clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    documento character varying(25) NOT NULL,
    tipo_documento character varying(25) NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    direccion character varying(255),
    telefono character varying(15),
    correo character varying(255),
    activo boolean DEFAULT true NOT NULL,
    link_whatsapp character varying(255),
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_modificacion timestamp without time zone DEFAULT now() NOT NULL
);

-- Crear tabla proveedores
CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    nombre character varying(150) NOT NULL,
    nit character varying(50) NOT NULL,
    telefono character varying(15) NOT NULL,
    direccion character varying(255),
    correo character varying(255),
    activo boolean DEFAULT true NOT NULL,
    link_whatsapp character varying(255),
    id_moneda integer NOT NULL REFERENCES monedas(id),
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_modificacion timestamp without time zone DEFAULT now() NOT NULL
);

-- Crear tabla productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    codigo character varying(50) NOT NULL,
    nombre character varying(100) NOT NULL,
    presentacion character varying(150) NOT NULL,
    dimensiones character varying(50),
    precio_compra numeric(10,2) NOT NULL,
    precio_venta numeric(10,2) NOT NULL,
    precio_agranel numeric(10,4),
    total_presentacion integer,
    activo boolean NOT NULL,
    id_categoria integer NOT NULL REFERENCES categorias(id),
    id_proveedor integer NOT NULL REFERENCES proveedores(id),
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_modificacion timestamp without time zone DEFAULT now() NOT NULL
);

-- Crear tabla cajas
CREATE TABLE cajas (
    id SERIAL PRIMARY KEY,
    monto_inicial numeric(10,2) NOT NULL,
    monto_final numeric(10,2),
    total_ingresos numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    total_egresos numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    fecha_apertura timestamp without time zone NOT NULL,
    fecha_cierre timestamp without time zone,
    estado character varying(20) DEFAULT 'abierta'::character varying NOT NULL,
    usuario_apertura_id integer REFERENCES usuarios(id),
    usuario_cierre_id integer REFERENCES usuarios(id),
    sucursal_id integer REFERENCES sucursales(id),
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_modificacion timestamp without time zone DEFAULT now() NOT NULL
);

-- Crear tabla inventarios_sucursal
CREATE TABLE inventarios_sucursales (
    id SERIAL PRIMARY KEY,
    id_producto integer NOT NULL REFERENCES productos(id),
    id_sucursal integer NOT NULL REFERENCES sucursales(id),
    stock_actual numeric(10,2) NOT NULL,
    stock_minimo numeric(10,2) NOT NULL,
    stock_maximo numeric(10,2),
    tipo_unidad_id integer NOT NULL REFERENCES tipos_unidades(id),
    se_vende_fraccion boolean DEFAULT false NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_modificacion timestamp without time zone DEFAULT now() NOT NULL
);

-- Crear tabla movimientos_inventarios
CREATE TABLE movimientos_inventarios (
    id SERIAL PRIMARY KEY,
    documento_referencia character varying(50),
    id_producto integer NOT NULL REFERENCES productos(id),
    id_sucursal integer NOT NULL REFERENCES sucursales(id),
    tipo_movimiento character varying(50) NOT NULL,
    cantidad numeric(10,2) NOT NULL,
    motivo character varying(50) NOT NULL,
    estado character varying(20) DEFAULT 'REALIZADO'::character varying NOT NULL,
    id_usuario integer NOT NULL REFERENCES usuarios(id),
    id_sucursal_destino integer REFERENCES sucursales(id),
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_modificacion timestamp without time zone DEFAULT now() NOT NULL
);

-- Crear tabla ventas
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    numero_documento character varying(200) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    total_venta numeric(10,2) NOT NULL,
    metodo_pago character varying(50) DEFAULT 'efectivo'::character varying NOT NULL,
    estado character varying(20) DEFAULT 'completada'::character varying NOT NULL,
    monto_pagado numeric(10,2),
    cambio numeric(10,2),
    fecha_anulacion timestamp without time zone,
    nombre_cliente character varying(200),
    documento_cliente character varying(25),
    usuario_id integer REFERENCES usuarios(id),
    sucursal_id integer REFERENCES sucursales(id),
    cliente_id integer REFERENCES clientes(id),
    caja_id integer REFERENCES cajas(id),
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_modificacion timestamp without time zone DEFAULT now() NOT NULL
);

-- Crear tabla detalle_ventas
CREATE TABLE detalle_ventas (
    id SERIAL PRIMARY KEY,
    cantidad numeric(10,2) NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    descuento numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    venta_id integer REFERENCES ventas(id),
    producto_id integer REFERENCES productos(id),
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL
);

-- Crear tabla compras
CREATE TABLE compras (
    id SERIAL PRIMARY KEY,
    numero_documento character varying(200) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    total_compra numeric(10,2) NOT NULL,
    metodo_pago character varying(50) DEFAULT 'efectivo'::character varying NOT NULL,
    estado character varying(20) DEFAULT 'completada'::character varying NOT NULL,
    fecha_anulacion timestamp without time zone,
    "usuarioId" integer REFERENCES usuarios(id),
    "sucursalId" integer REFERENCES sucursales(id),
    "proveedorId" integer NOT NULL REFERENCES proveedores(id),
    "cajaId" integer REFERENCES cajas(id),
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_modificacion timestamp without time zone DEFAULT now() NOT NULL
);

-- Crear tabla detalle_compras
CREATE TABLE detalle_compras (
    id SERIAL PRIMARY KEY,
    cantidad numeric(10,2) NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    descuento numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    compra_id integer REFERENCES compras(id),
    producto_id integer REFERENCES productos(id),
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL
);

-- Crear tabla cotizacion
CREATE TABLE cotizaciones (
     id SERIAL PRIMARY KEY,
    numero_documento character varying(200) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    total_venta numeric(10,2) NOT NULL,
    metodo_pago character varying(50) DEFAULT 'efectivo'::character varying NOT NULL,
    estado character varying(20) DEFAULT 'completada'::character varying NOT NULL,
    nombre_cliente character varying(200),
    documento_cliente character varying(25),
    fecha_anulacion timestamp without time zone,
    usuario_id integer REFERENCES usuarios(id),
    sucursal_id integer REFERENCES sucursales(id),
    cliente_id integer REFERENCES clientes(id),
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_modificacion timestamp without time zone DEFAULT now() NOT NULL
);

-- Crear tabla detalle_cotizacion
CREATE TABLE detalle_cotizaciones (
    id SERIAL PRIMARY KEY,
    cantidad numeric(10,2) NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    descuento numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    producto_id integer REFERENCES productos(id),
    cotizacion_id integer REFERENCES cotizaciones(id),
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL
);
