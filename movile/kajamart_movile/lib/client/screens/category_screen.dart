import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class CategoryScreen extends StatefulWidget {
  const CategoryScreen({super.key});

  @override
  _CategoryScreenState createState() => _CategoryScreenState();
}

class _CategoryScreenState extends State<CategoryScreen> {
  final List<_Category> _categories = [];
  bool _isLoading = true;
  String? _errorMessage;
  String searchQuery = "";

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await http
          .get(Uri.parse('http://localhost:3000/kajamart/api/categories'));

      if (response.statusCode == 200) {
        final dynamic decodedBody = jsonDecode(response.body);

        final List<dynamic> rawCategories;

        if (decodedBody is List) {
          rawCategories = decodedBody;
        } else if (decodedBody is Map<String, dynamic>) {
          final dynamic data = decodedBody['data'] ?? decodedBody['categories'];
          if (data is List) {
            rawCategories = data;
          } else if (decodedBody.containsKey('id_categoria')) {
            rawCategories = [decodedBody];
          } else {
            throw const FormatException();
          }
        } else {
          throw const FormatException();
        }

        final List<_Category> parsedCategories = rawCategories
            .map((dynamic item) => _Category.fromJson(item))
            .toList();

        setState(() {
          _categories
            ..clear()
            ..addAll(parsedCategories);
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage =
              'No se pudieron cargar las categorías. Código: ${response.statusCode}';
          _isLoading = false;
        });
      }
    } catch (error) {
      setState(() {
        _errorMessage = 'Ocurrió un error al cargar las categorías.';
        _isLoading = false;
      });
    }
  }

  List<_Category> get _filteredCategories {
    if (searchQuery.isEmpty) {
      return List<_Category>.from(_categories);
    }

    return _categories
        .where((category) =>
            category.name.toLowerCase().contains(searchQuery.toLowerCase()))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final List<_Category> filteredCategories = _filteredCategories;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color.fromARGB(136, 135, 234, 129),
        title: Container(
          height: 40,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
          ),
          child: TextField(
            onChanged: (value) {
              setState(() {
                searchQuery = value;
              });
            },
            decoration: InputDecoration(
              hintText: "Buscar categorías...",
              prefixIcon: Icon(Icons.search, color: Colors.grey),
              border: InputBorder.none,
              contentPadding: EdgeInsets.symmetric(vertical: 10),
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          // Lista de categorías
          Expanded(
            child: AnimatedSwitcher(
              duration: Duration(milliseconds: 400),
              switchInCurve: Curves.easeIn,
              switchOutCurve: Curves.easeOut,
              child: Builder(
                builder: (context) {
                  if (_isLoading) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  if (_errorMessage != null) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              _errorMessage!,
                              textAlign: TextAlign.center,
                              style: const TextStyle(fontSize: 16),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: _loadCategories,
                              icon: const Icon(Icons.refresh),
                              label: const Text('Reintentar'),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  if (filteredCategories.isEmpty) {
                    return const Center(
                      child: Text('No hay categorías disponibles.'),
                    );
                  }

                  return GridView.builder(
                    key: ValueKey(filteredCategories.length),
                    padding: const EdgeInsets.all(8),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 8,
                      mainAxisSpacing: 8,
                      childAspectRatio: 0.9,
                    ),
                    itemCount: filteredCategories.length,
                    itemBuilder: (context, index) {
                      final _Category category = filteredCategories[index];
                      return TweenAnimationBuilder(
                        tween: Tween<double>(begin: 0, end: 1),
                        duration: Duration(milliseconds: 300 + (index * 100)),
                        curve: Curves.easeOut,
                        builder: (context, double value, child) {
                          return Opacity(
                            opacity: value,
                            child: Transform.translate(
                              offset: Offset(0, 40 * (1 - value)),
                              child: child,
                            ),
                          );
                        },
                        child: GestureDetector(
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                  'Categoría: ${category.name}',
                                ),
                                duration: const Duration(seconds: 2),
                              ),
                            );
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(10),
                              boxShadow: const [
                                BoxShadow(
                                  color: Colors.black12,
                                  blurRadius: 4,
                                  offset: Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                Expanded(
                                  child: Center(
                                    child: Icon(
                                      Icons.category,
                                      size: 48,
                                      color: Theme.of(context)
                                          .colorScheme
                                          .primary,
                                    ),
                                  ),
                                ),
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 12,
                                  ),
                                  child: Column(
                                    children: [
                                      Text(
                                        category.name,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14,
                                        ),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                        textAlign: TextAlign.center,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        category.description,
                                        style: TextStyle(
                                          color: Colors.grey.shade600,
                                          fontSize: 12,
                                        ),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                        textAlign: TextAlign.center,
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Category {
  const _Category({
    required this.id,
    required this.name,
    required this.description,
    required this.isActive,
  });

  final int id;
  final String name;
  final String description;
  final bool isActive;

  factory _Category.fromJson(Map<String, dynamic> json) {
    final dynamic idValue = json['id_categoria'];
    final dynamic nameValue = json['nombre_categoria'];
    final dynamic descriptionValue = json['descripcion_categoria'];

    return _Category(
      id: idValue is int
          ? idValue
          : int.tryParse(idValue?.toString() ?? '') ?? 0,
      name: nameValue?.toString() ?? '',
      description: descriptionValue?.toString() ?? '',
      isActive: json['estado'] == null
          ? true
          : json['estado'] is bool
              ? json['estado'] as bool
              : json['estado'].toString().toLowerCase() == 'true',
    );
  }
}
