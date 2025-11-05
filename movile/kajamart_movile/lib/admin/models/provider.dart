// lib/models/provider.dart
import 'provider_category.dart';

enum ProviderStatus {
  activo,
  inactivo,
}

extension ProviderStatusExtension on ProviderStatus {
  String get displayName {
    switch (this) {
      case ProviderStatus.activo:
        return 'Activo';
      case ProviderStatus.inactivo:
        return 'Inactivo';
    }
  }

  int get colorValue {
    switch (this) {
      case ProviderStatus.activo:
        return 0xff4CAF50; // Verde
      case ProviderStatus.inactivo:
        return 0xffF44336; // Rojo
    }
  }

  static ProviderStatus fromValue(dynamic value) {
    if (value is ProviderStatus) {
      return value;
    }

    if (value is bool) {
      return value ? ProviderStatus.activo : ProviderStatus.inactivo;
    }

    final normalized = value?.toString().toLowerCase().trim() ?? '';
    switch (normalized) {
      case 'activo':
      case 'active':
      case 'enabled':
      case '1':
        return ProviderStatus.activo;
      case 'inactivo':
      case 'inactive':
      case 'disabled':
      case '0':
      case 'false':
        return ProviderStatus.inactivo;
      default:
        return ProviderStatus.activo;
    }
  }
}

class Provider {
  final String nit;
  final String name;
  final String contactName;
  final String phone;
  final List<ProviderCategory> categories;
  final ProviderStatus status;
  final String? email;
  final String? address;
  final DateTime? registrationDate;
  final double? averageRating;
  final String? imageUrl;

  const Provider({
    required this.nit,
    required this.name,
    required this.contactName,
    required this.phone,
    required this.categories,
    required this.status,
    this.email,
    this.address,
    this.registrationDate,
    this.averageRating,
    this.imageUrl,
  });

  factory Provider.fromJson(Map<String, dynamic> json) {
    final nit = _readString(json, ['nit', 'supplierNit', 'supplier_nit', 'id', 'uuid']);
    final name = _readString(json, ['name', 'supplierName', 'supplier_name', 'businessName']);
    final contactName =
        _readString(json, ['contactName', 'contact_name', 'contact', 'contactPerson']);
    final phone = _readString(json, ['phone', 'phoneNumber', 'phone_number', 'mobile']);
    final email = _readOptionalString(json, ['email', 'emailAddress', 'email_address']);
    final address =
        _readOptionalString(json, ['address', 'addressLine', 'address_line', 'location']);
    final imageUrl =
        _readOptionalString(json, ['imageUrl', 'image_url', 'logoUrl', 'logo_url']);

    final registrationDate = _parseDate(json);

    final averageRating = _readOptionalDouble(json, ['averageRating', 'rating']);

    final categoriesRaw = json['categories'] ?? json['category'] ?? json['supplierCategories'];
    final categories = _parseCategories(categoriesRaw);

    final statusValue = json['status'] ?? json['state'] ?? json['isActive'];
    final status = ProviderStatusExtension.fromValue(statusValue);

    return Provider(
      nit: nit,
      name: name,
      contactName: contactName,
      phone: phone,
      categories: categories,
      status: status,
      email: email,
      address: address,
      registrationDate: registrationDate,
      averageRating: averageRating,
      imageUrl: imageUrl,
    );
  }

  Provider copyWith({
    String? nit,
    String? name,
    String? contactName,
    String? phone,
    List<ProviderCategory>? categories,
    ProviderStatus? status,
    String? email,
    String? address,
    DateTime? registrationDate,
    double? averageRating,
    String? imageUrl,
  }) {
    return Provider(
      nit: nit ?? this.nit,
      name: name ?? this.name,
      contactName: contactName ?? this.contactName,
      phone: phone ?? this.phone,
      categories: categories ?? this.categories,
      status: status ?? this.status,
      email: email ?? this.email,
      address: address ?? this.address,
      registrationDate: registrationDate ?? this.registrationDate,
      averageRating: averageRating ?? this.averageRating,
      imageUrl: imageUrl ?? this.imageUrl,
    );
  }

  // Método para obtener las primeras 2 categorías y contar las restantes
  String get categoriesDisplay {
    if (categories.isEmpty) {
      return 'Sin categorías';
    }

    if (categories.length <= 2) {
      return categories.map((cat) => cat.name).join(', ');
    }
    final firstTwo = categories.take(2).map((cat) => cat.name).join(', ');
    final remaining = categories.length - 2;
    return '$firstTwo, +$remaining';
  }

  // Método para obtener todas las categorías como string
  String get allCategoriesDisplay {
    if (categories.isEmpty) {
      return 'Sin categorías';
    }
    return categories.map((cat) => cat.name).join(', ');
  }

  @override
  String toString() => name;
}

String _readString(Map<String, dynamic> json, List<String> keys) {
  final value = _readOptionalString(json, keys);
  if (value != null && value.isNotEmpty) {
    return value;
  }
  return 'No disponible';
}

String? _readOptionalString(Map<String, dynamic> json, List<String> keys) {
  for (final key in keys) {
    if (json.containsKey(key) && json[key] != null) {
      final value = json[key];
      if (value is String) {
        return value;
      }
      return value.toString();
    }
  }
  return null;
}

double? _readOptionalDouble(Map<String, dynamic> json, List<String> keys) {
  for (final key in keys) {
    if (json.containsKey(key) && json[key] != null) {
      final value = json[key];
      if (value is num) {
        return value.toDouble();
      }
      final parsed = double.tryParse(value.toString());
      if (parsed != null) {
        return parsed;
      }
    }
  }
  return null;
}

List<ProviderCategory> _parseCategories(dynamic raw) {
  if (raw == null) {
    return const [];
  }

  if (raw is List) {
    return raw.map((item) => ProviderCategory.fromJson(item)).toList();
  }

  return [ProviderCategory.fromJson(raw)];
}

DateTime? _parseDate(Map<String, dynamic> json) {
  final potentialKeys = ['registrationDate', 'registration_date', 'createdAt', 'created_at'];

  for (final key in potentialKeys) {
    if (!json.containsKey(key)) continue;
    final value = json[key];
    if (value == null) continue;

    if (value is String && value.isNotEmpty) {
      final parsed = DateTime.tryParse(value);
      if (parsed != null) {
        return parsed;
      }
    }

    if (value is int) {
      if (value.toString().length == 10) {
        return DateTime.fromMillisecondsSinceEpoch(value * 1000, isUtc: true).toLocal();
      }
      if (value.toString().length == 13) {
        return DateTime.fromMillisecondsSinceEpoch(value, isUtc: true).toLocal();
      }
    }

    if (value is double) {
      return DateTime.fromMillisecondsSinceEpoch(value.toInt(), isUtc: true).toLocal();
    }
  }

  return null;
}
