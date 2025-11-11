// lib/models/provider_category.dart
class ProviderCategory {
  final String id;
  final String name;
  final String description;

  const ProviderCategory({
    required this.id,
    required this.name,
    required this.description,
  });

  factory ProviderCategory.fromJson(dynamic json) {
    if (json is ProviderCategory) {
      return json;
    }

    if (json is Map<String, dynamic>) {
      final id = (json['id'] ?? json['uuid'] ?? json['code'] ?? '').toString();
      final name = (json['name'] ?? json['title'] ?? json['label'] ?? '').toString();
      final description =
          (json['description'] ?? json['details'] ?? json['summary'] ?? '').toString();

      final resolvedName = name.isEmpty ? 'Sin categoría' : name;
      final resolvedId = id.isEmpty ? resolvedName : id;

      return ProviderCategory(
        id: resolvedId,
        name: resolvedName,
        description: description,
      );
    }

    if (json is String) {
      final value = json.trim();
      return ProviderCategory(
        id: value.isEmpty ? 'category' : value,
        name: value.isEmpty ? 'Sin categoría' : value,
        description: '',
      );
    }

    return const ProviderCategory(
      id: 'category',
      name: 'Sin categoría',
      description: '',
    );
  }

  @override
  String toString() => name;
}
