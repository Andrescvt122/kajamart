import 'package:flutter/material.dart';

class Product {
  const Product({
    required this.id,
    required this.name,
    required this.description,
    this.price,
    this.imageUrl,
    this.stockActual,
    this.stockMinimo,
    this.stockMaximo,
    this.isActive,
    this.iva,
    this.icu,
    this.percentageIncrement,
    this.costUnit,
    this.createdAt,
    this.updatedAt,
    this.categoryName,
    this.categoryDescription,
    this.categoryState,
    this.details = const <ProductDetail>[],
  });

  final int id;
  final String name;
  final String description;
  final double? price;
  final String? imageUrl;
  final int? stockActual;
  final int? stockMinimo;
  final int? stockMaximo;
  final bool? isActive;
  final double? iva;
  final double? icu;
  final double? percentageIncrement;
  final double? costUnit;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final String? categoryName;
  final String? categoryDescription;
  final bool? categoryState;
  final List<ProductDetail> details;

  String get priceLabel => price != null ? '\$${price!.toStringAsFixed(0)}' : 'S/D';

  String get statusLabel {
    if (isActive == null) return 'Sin estado';
    return isActive! ? 'Activo' : 'Inactivo';
  }

  factory Product.fromJson(Map<String, dynamic> json) {
    int? _tryParseInt(dynamic value) {
      if (value is int) return value;
      if (value is double) return value.toInt();
      return int.tryParse(value?.toString() ?? '');
    }

    double? _tryParseDouble(dynamic value) {
      if (value is int) return value.toDouble();
      if (value is double) return value;
      return double.tryParse(value?.toString() ?? '');
    }

    bool? _tryParseBool(dynamic value) {
      if (value is bool) return value;
      if (value is num) return value != 0;
      final String stringValue = value?.toString().toLowerCase() ?? '';
      if (stringValue == 'true') return true;
      if (stringValue == 'false') return false;
      return null;
    }

    DateTime? _tryParseDate(dynamic value) {
      if (value is DateTime) return value;
      if (value is String && value.isNotEmpty) {
        return DateTime.tryParse(value);
      }
      return null;
    }

    final List<ProductDetail> parsedDetails = <ProductDetail>[];
    final dynamic rawDetails = json['detalle_productos'];
    if (rawDetails is List) {
      for (final dynamic item in rawDetails) {
        if (item is Map<String, dynamic>) {
          parsedDetails.add(ProductDetail.fromJson(item));
        }
      }
    }

    final Map<String, dynamic>? categoryData =
        json['categorias'] is Map<String, dynamic>
            ? json['categorias'] as Map<String, dynamic>
            : null;

    return Product(
      id: _tryParseInt(json['id_producto']) ?? 0,
      name: json['nombre']?.toString() ?? '',
      description: json['descripcion']?.toString() ?? '',
      price: _tryParseDouble(json['precio_venta']),
      imageUrl: json['url_imagen']?.toString(),
      stockActual: _tryParseInt(json['stock_actual']),
      stockMinimo: _tryParseInt(json['stock_minimo']),
      stockMaximo: _tryParseInt(json['stock_maximo']),
      isActive: _tryParseBool(json['estado']),
      iva: _tryParseDouble(json['iva']),
      icu: _tryParseDouble(json['icu']),
      percentageIncrement: _tryParseDouble(json['porcentaje_incremento']),
      costUnit: _tryParseDouble(json['costo_unitario']),
      createdAt: _tryParseDate(json['created_at']),
      updatedAt: _tryParseDate(json['updated_at']),
      categoryName: categoryData?['nombre_categoria']?.toString(),
      categoryDescription: categoryData?['descripcion_categoria']?.toString(),
      categoryState: _tryParseBool(categoryData?['estado']),
      details: parsedDetails,
    );
  }
}

class ProductDetail {
  const ProductDetail({
    required this.id,
    required this.barcode,
    this.expirationDate,
    this.stock,
    this.isReturn,
    this.isActive,
  });

  final int id;
  final String barcode;
  final DateTime? expirationDate;
  final int? stock;
  final bool? isReturn;
  final bool? isActive;

  factory ProductDetail.fromJson(Map<String, dynamic> json) {
    int? _tryParseInt(dynamic value) {
      if (value is int) return value;
      if (value is double) return value.toInt();
      return int.tryParse(value?.toString() ?? '');
    }

    DateTime? _tryParseDate(dynamic value) {
      if (value is DateTime) return value;
      if (value is String && value.isNotEmpty) {
        return DateTime.tryParse(value);
      }
      return null;
    }

    bool? _tryParseBool(dynamic value) {
      if (value is bool) return value;
      if (value is num) return value != 0;
      final String stringValue = value?.toString().toLowerCase() ?? '';
      if (stringValue == 'true') return true;
      if (stringValue == 'false') return false;
      return null;
    }

    return ProductDetail(
      id: _tryParseInt(json['id_detalle_producto']) ?? 0,
      barcode: json['codigo_barras_producto_compra']?.toString() ?? 'S/D',
      expirationDate: _tryParseDate(json['fecha_vencimiento']),
      stock: _tryParseInt(json['stock_producto']),
      isReturn: _tryParseBool(json['es_devolucion']),
      isActive: _tryParseBool(json['estado']),
    );
  }
}

class ProductDetailScreen extends StatelessWidget {
  const ProductDetailScreen({super.key, required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color.fromARGB(136, 135, 234, 129),
        title: Text(product.name),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _ProductImage(imageUrl: product.imageUrl, name: product.name),
            const SizedBox(height: 16),
            Text(
              product.name,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              product.description.isEmpty
                  ? 'Sin descripción disponible.'
                  : product.description,
              style: const TextStyle(fontSize: 14, color: Colors.black87),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                _TagChip(label: product.priceLabel, icon: Icons.attach_money),
                _TagChip(label: product.statusLabel, icon: Icons.info_outline),
                if (product.categoryName != null)
                  _TagChip(
                    label: product.categoryName!,
                    icon: Icons.category_outlined,
                  ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            _InfoRow('Stock actual', _formatNumber(product.stockActual)),
            _InfoRow('Stock mínimo', _formatNumber(product.stockMinimo)),
            _InfoRow('Stock máximo', _formatNumber(product.stockMaximo)),
            _InfoRow('Costo unitario', _formatCurrency(product.costUnit)),
            _InfoRow('IVA', _formatNumber(product.iva)),
            _InfoRow('ICU', _formatNumber(product.icu)),
            _InfoRow(
              'Incremento',
              product.percentageIncrement != null
                  ? '${product.percentageIncrement!.toStringAsFixed(2)}%'
                  : 'S/D',
            ),
            _InfoRow(
              'Fecha de creación',
              _formatDate(product.createdAt),
            ),
            _InfoRow(
              'Última actualización',
              _formatDate(product.updatedAt),
            ),
            if (product.categoryDescription != null &&
                product.categoryDescription!.trim().isNotEmpty)
              _InfoRow('Descripción de categoría', product.categoryDescription!),
            const SizedBox(height: 12),
            if (product.details.isNotEmpty) ...[
              const Text(
                'Detalles de producto',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ...product.details
                  .map((detail) => _ProductDetailCard(detail: detail))
                  .toList(),
            ],
          ],
        ),
      ),
    );
  }

  static String _formatNumber(num? value) {
    if (value == null) return 'S/D';
    return value.toString();
  }

  static String _formatCurrency(double? value) {
    if (value == null) return 'S/D';
    return '\$${value.toStringAsFixed(0)}';
  }

  static String _formatDate(DateTime? value) {
    if (value == null) return 'S/D';
    return '${value.day.toString().padLeft(2, '0')}/${value.month.toString().padLeft(2, '0')}/${value.year}';
  }
}

class _ProductImage extends StatelessWidget {
  const _ProductImage({required this.imageUrl, required this.name});

  final String? imageUrl;
  final String name;

  @override
  Widget build(BuildContext context) {
    final bool hasImage = imageUrl != null && imageUrl!.isNotEmpty;

    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: hasImage
          ? Image.network(
              imageUrl!,
              height: 200,
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => _PlaceholderBox(name: name),
            )
          : _PlaceholderBox(name: name),
    );
  }
}

class _PlaceholderBox extends StatelessWidget {
  const _PlaceholderBox({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 200,
      width: double.infinity,
      color: Colors.grey.shade200,
      alignment: Alignment.center,
      child: Text(
        name,
        textAlign: TextAlign.center,
        style: const TextStyle(color: Colors.black54),
      ),
    );
  }
}

class _TagChip extends StatelessWidget {
  const _TagChip({required this.label, required this.icon});

  final String label;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Chip(
      avatar: Icon(icon, size: 18),
      label: Text(label),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow(this.label, this.value);

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              style: const TextStyle(color: Colors.black87),
            ),
          ),
        ],
      ),
    );
  }
}

class _ProductDetailCard extends StatelessWidget {
  const _ProductDetailCard({required this.detail});

  final ProductDetail detail;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 6),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Código de barras: ${detail.barcode}',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text('Stock: ${detail.stock ?? 'S/D'}'),
            Text(
              'Fecha de vencimiento: '
              '${detail.expirationDate != null ? ProductDetailScreen._formatDate(detail.expirationDate) : 'S/D'}',
            ),
            Text('Es devolución: ${_mapBool(detail.isReturn)}'),
            Text('Estado: ${_mapBool(detail.isActive)}'),
          ],
        ),
      ),
    );
  }

  static String _mapBool(bool? value) {
    if (value == null) return 'S/D';
    return value ? 'Sí' : 'No';
  }
}
