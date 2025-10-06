import 'package:flutter/material.dart';

class CategoryScreen extends StatefulWidget {
  const CategoryScreen({super.key});

  @override
  _CategoryScreenState createState() => _CategoryScreenState();
}

class _CategoryScreenState extends State<CategoryScreen> {
  final List<Map<String, dynamic>> categories = [
    {
      "id": 1,
      "name": "Lácteos",
      "image": "assets/images/lacteos.png",
      "productCount": 4,
    },
    {
      "id": 2,
      "name": "Panadería",
      "image": "assets/images/mecato.jpg",
      "productCount": 1,
    },
    {
      "id": 3,
      "name": "Cereales",
      "image": "assets/images/mecato.jpg",
      "productCount": 1,
    },
    {
      "id": 4,
      "name": "Huevos",
      "image": "assets/images/mecato.jpg",
      "productCount": 1,
    },
    {
      "id": 5,
      "name": "Bebidas",
      "image": "assets/images/gaseosas.jpg",
      "productCount": 3,
    },
    {
      "id": 6,
      "name": "Embutidos",
      "image": "assets/images/embutidos.webp",
      "productCount": 0,
    },
    {
      "id": 7,
      "name": "Dulces",
      "image": "assets/images/dulces.png",
      "productCount": 0,
    },
    {
      "id": 8,
      "name": "Licores",
      "image": "assets/images/licores.png",
      "productCount": 0,
    },
    {
      "id": 9,
      "name": "Limpieza",
      "image": "assets/images/limpieza.jpg",
      "productCount": 0,
    },
    {
      "id": 10,
      "name": "Higiene Personal",
      "image": "assets/images/higiene_personal.jpg",
      "productCount": 0,
    },
    {
      "id": 11,
      "name": "Canasta Familiar",
      "image": "assets/images/canasta_familiar.jpg",
      "productCount": 0,
    },
  ];

  String searchQuery = "";

  @override
  Widget build(BuildContext context) {
    // Filtrar categorías
    List<Map<String, dynamic>> filteredCategories = categories.where((
      category,
    ) {
      return category["name"].toLowerCase().contains(searchQuery.toLowerCase());
    }).toList();

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
              child: GridView.builder(
                key: ValueKey(filteredCategories.length),
                padding: EdgeInsets.all(8),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 8,
                  mainAxisSpacing: 8,
                  childAspectRatio: 0.8,
                ),
                itemCount: filteredCategories.length,
                itemBuilder: (context, index) {
                  final category = filteredCategories[index];
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
                        // Aquí puedes implementar navegación a productos por categoría
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              "Categoría: ${category['name']} - ${category['productCount']} productos",
                            ),
                            duration: Duration(seconds: 2),
                          ),
                        );
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black12,
                              blurRadius: 4,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Expanded(
                              child: ClipRRect(
                                borderRadius: BorderRadius.vertical(
                                  top: Radius.circular(10),
                                ),
                                child: Image.asset(
                                  category["image"],
                                  fit: BoxFit.cover,
                                ),
                              ),
                            ),
                            Padding(
                              padding: EdgeInsets.all(8),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  Text(
                                    category["name"],
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                    ),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    textAlign: TextAlign.center,
                                  ),
                                  SizedBox(height: 4),
                                  Text(
                                    "${category['productCount']} productos",
                                    style: TextStyle(
                                      color: Colors.grey.shade600,
                                      fontSize: 12,
                                    ),
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
              ),
            ),
          ),
        ],
      ),
    );
  }
}
