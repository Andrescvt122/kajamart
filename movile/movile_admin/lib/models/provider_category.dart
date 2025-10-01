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

  @override
  String toString() => name;
}
