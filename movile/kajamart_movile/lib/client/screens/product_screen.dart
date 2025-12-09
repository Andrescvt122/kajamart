
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

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class ProductScreen extends StatefulWidget {
  final Map<String, dynamic> product;

  const ProductScreen({super.key, required this.product});

  @override
  State<ProductScreen> createState() => _ProductScreenState();
}

class _ProductScreenState extends State<ProductScreen> {
  final String _baseUrl = 'http://localhost:3000/kajamart/api';
  List<Map<String, dynamic>> _details = [];
  bool _isLoadingDetails = true;
  String? _detailsError;

  @override
  void initState() {
    super.initState();
    _loadDetails();
  }

  Future<void> _loadDetails() async {
    final productId = widget.product['id'];
    if (productId == null) {
      setState(() {
        _isLoadingDetails = false;
        _detailsError = 'No se encontró el id del producto.';
      });
      return;
    }

    try {
      final response =
          await http.get(Uri.parse('$_baseUrl/detailsProducts/producto/$productId'));

      if (response.statusCode == 200) {
        final dynamic decoded = jsonDecode(response.body);
        final List<dynamic> rawDetails;

        if (decoded is List) {
          rawDetails = decoded;
        } else if (decoded is Map<String, dynamic>) {
          final dynamic data = decoded['data'] ?? decoded['items'] ?? decoded['detalles'];
          if (data is List) {
            rawDetails = data;
          } else if (decoded.containsKey('id_detalle_producto')) {
            rawDetails = [decoded];
          } else {
            rawDetails = const [];
          }
        } else {
          rawDetails = const [];
        }

        setState(() {
          _details = rawDetails.whereType<Map<String, dynamic>>().toList();
          _isLoadingDetails = false;
          _detailsError = null;
        });
      } else if (response.statusCode == 404) {
        setState(() {
          _details = [];
          _isLoadingDetails = false;
          _detailsError = null;
        });
      } else {
        setState(() {
          _isLoadingDetails = false;
          _detailsError =
              'No se pudieron cargar los detalles. Código: ${response.statusCode}';
        });
      }
    } catch (_) {
      setState(() {
        _isLoadingDetails = false;
        _detailsError = 'Ocurrió un error al cargar los detalles.';
      });
    }
  }

  Future<http.Response?> _ensureDetailsResponse(
    http.Response primary,
    Uri fallbackUri,
  ) async {
    if (primary.statusCode == 200 || primary.statusCode == 404) {
      return primary;
    }

    try {
      final fallbackResponse = await http.get(fallbackUri);
      return fallbackResponse;
    } catch (_) {
      return primary;
    }
  }

  List<Map<String, dynamic>> _parseDetailsResponse(String body) {
    final dynamic decoded = jsonDecode(body);
    final List<dynamic> rawDetails;

    if (decoded is List) {
      rawDetails = decoded;
    } else if (decoded is Map<String, dynamic>) {
      final dynamic data = decoded['data'] ?? decoded['items'] ?? decoded['detalles'];
      if (data is List) {
        rawDetails = data;
      } else if (decoded.containsKey('id_detalle_producto')) {
        rawDetails = [decoded];
      } else {
        rawDetails = const [];
      }
    } else {
      rawDetails = const [];
    }

    return rawDetails.whereType<Map<String, dynamic>>().toList();
  }

  int _stockValue() {
    final dynamic stock =
        widget.product['stock'] ?? widget.product['stock_actual'] ?? 0;
    if (stock is num) return stock.toInt();
    return int.tryParse(stock.toString()) ?? 0;
  }

  String _formatPrice(dynamic value) {
    final num price = value is num ? value : num.tryParse(value.toString()) ?? 0;
    return 'COP ${price.toStringAsFixed(0)}';
  }

  String? _formatDate(dynamic value) {
    if (value == null) return null;
    try {
      final date = DateTime.parse(value.toString());
      return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
    } catch (_) {
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final String name = product['name'] ?? 'Producto';
    final String status = product['status'] ?? '';
    final String category = product['category'] ?? '';
    final bool isActive = status.toLowerCase() == 'activo';
    final String priceLabel = _formatPrice(product['price']);
    final String description = product['description'] ??
        'Disfruta de este producto seleccionado especialmente para ti. Calidad, frescura y un precio justo para tu día a día.';

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        backgroundColor: const Color.fromARGB(136, 135, 234, 129),
        elevation: 0,
        title: Text(
          name,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 10,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Stack(
                  children: [
                    Hero(
                      tag: 'product-image-${product["id"]}',
                      child: _buildProductImage(product['image'] ?? ''),
                    ),
                    Positioned(
                      top: 12,
                      right: 12,
                      child: Container(
                        padding:
                            const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white70,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.circle,
                              size: 10,
                              color: isActive ? Colors.green : Colors.red,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              status,
                              style: TextStyle(
                                color: isActive ? Colors.green.shade700 : Colors.red,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 6,
                    offset: Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: const Color.fromARGB(136, 135, 234, 129),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.sell, size: 16, color: Colors.white),
                            const SizedBox(width: 6),
                            Text(
                              priceLabel,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Chip(
                        backgroundColor: Colors.green.shade50,
                        label: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.category_outlined,
                                size: 18, color: Colors.green),
                            const SizedBox(width: 6),
                            Text(
                              category,
                              style: const TextStyle(
                                color: Colors.green,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Descripción',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    description,
                    style: TextStyle(
                      color: Colors.grey.shade700,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                children: [
                  Expanded(
                    child: _InfoTile(
                      icon: Icons.verified_outlined,
                      title: 'Estado',
                      value: isActive ? 'Disponible' : 'No disponible',
                      color: isActive ? Colors.green : Colors.red,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _InfoTile(
                      icon: Icons.inventory_2_outlined,
                      title: 'Stock',
                      value: '${_stockValue()} unidades',
                      color: Colors.orange.shade700,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: _buildDetailsSection(),
            ),
            const SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00C853),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  elevation: 4,
                ),
                onPressed: () {},
                child: const Text(
                  'Agregar al carrito',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
>>>>>>> ab27595bca0b0d0abcb8c0509065a894adec9981
          ],
        ),
      ),
    );
  }

  Widget _buildDetailsSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 6,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Detalles del inventario',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 10),
          if (_isLoadingDetails)
            const Center(child: CircularProgressIndicator())
          else if (_detailsError != null)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _detailsError!,
                  style: const TextStyle(color: Colors.red),
                ),
                TextButton.icon(
                  onPressed: _loadDetails,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Reintentar'),
                ),
              ],
            )
          else if (_details.isEmpty)
            const Text('No hay detalles registrados para este producto.')
          else
            Column(
              children: _details.map(_buildDetailCard).toList(),
            ),
        ],
      ),
    );
  }

  Widget _buildDetailCard(Map<String, dynamic> detail) {
    final String code =
        detail['codigo_barras_producto_compra']?.toString() ?? 'Sin código';
    final int stock = (detail['stock_producto'] is num)
        ? (detail['stock_producto'] as num).toInt()
        : int.tryParse(detail['stock_producto']?.toString() ?? '0') ?? 0;
    final String? expiry = _formatDate(detail['fecha_vencimiento']);
    final bool isReturn = detail['es_devolucion'] == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Lote #${detail['id_detalle_producto'] ?? '-'}',
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 15,
            ),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.qr_code, size: 18, color: Colors.grey),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  code,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.inventory_2_outlined, size: 18, color: Colors.grey),
              const SizedBox(width: 8),
              Text('Stock: $stock'),
            ],
          ),
          if (expiry != null) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.calendar_today, size: 16, color: Colors.grey),
                const SizedBox(width: 8),
                Text('Vence: $expiry'),
              ],
            ),
          ],
          if (isReturn) ...[
            const SizedBox(height: 6),
            Chip(
              label: const Text('Producto devuelto'),
              backgroundColor: Colors.red.shade50,
              labelStyle: const TextStyle(color: Colors.red),
              visualDensity: VisualDensity.compact,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildProductImage(String image) {
    if (image.isEmpty) {
      return Container(
        height: 260,
        color: Colors.grey.shade200,
        alignment: Alignment.center,
        child: const Icon(Icons.image_not_supported, color: Colors.grey),
      );
    }

    if (image.startsWith('data:image')) {
      final base64Data = image.split(',').last;
      return Image.memory(
        base64Decode(base64Data),
        fit: BoxFit.cover,
        height: 260,
        width: double.infinity,
      );
    }

    return Image.network(
      image,
      fit: BoxFit.cover,
      height: 260,
      width: double.infinity,
      errorBuilder: (context, error, stackTrace) {
        return Container(
          height: 260,
          color: Colors.grey.shade200,
          alignment: Alignment.center,
          child: const Icon(Icons.image_not_supported, color: Colors.grey),
        );
      },
    );
  }
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final Color color;

  const _InfoTile({
    required this.icon,
    required this.title,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 6,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: color.withOpacity(0.1),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  color: Colors.grey.shade600,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
