// lib/services/navigation_service.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:movile_admin/constants/app_constants.dart';
import 'package:movile_admin/models/provider.dart' as model;
import '../models/product.dart';
import '../services/provider_service.dart';
import '../screens/product_list.dart';
import '../screens/product_batches.dart';
import '../screens/product_detail.dart';
import '../screens/provider_list.dart';
import '../screens/provider_detail.dart';

class NavigationService {
  static int get navigationItemCount => getNavigationItems().length;

  static Route<dynamic>? onGenerateRoute(
    RouteSettings settings,
    BuildContext context,
  ) {
    final providerService = Provider.of<ProviderService>(
      context,
      listen: false,
    );

    switch (settings.name) {
      case '/':
        return MaterialPageRoute(
          builder: (_) => const ProductListScreen(),
        );

      case '/suppliers':
        return MaterialPageRoute(
          builder: (_) =>
              ProviderListScreen(providers: providerService.providers),
        );

      case '/batches':
        final product = settings.arguments as Product?;
        return MaterialPageRoute(
          builder: (_) => const ProductBatchesScreen(),
          settings: RouteSettings(name: settings.name, arguments: product),
        );

      case '/detail':
        final args = settings.arguments as Map<String, dynamic>?;
        return MaterialPageRoute(
          builder: (_) => const ProductDetailScreen(),
          settings: RouteSettings(name: settings.name, arguments: args),
        );

      case '/provider-detail':
        final provider = settings.arguments != null
            ? settings.arguments as model.Provider
            : null;
        return MaterialPageRoute(
          builder: (_) => ProviderDetailScreen(provider: provider),
          settings: RouteSettings(name: settings.name, arguments: provider),
        );

      default:
        // Para secciones no implementadas
        final sectionIndex = _getSectionIndexFromName(settings.name);
        return MaterialPageRoute(
          builder: (_) => _buildUnderConstructionScreen(sectionIndex),
        );
    }

    // Fallback (aunque nunca se alcanza debido al default case arriba)
    return MaterialPageRoute(
      builder: (_) => const ProductListScreen(),
    );
  }

  static Widget _buildUnderConstructionScreen(int? sectionIndex) {
    return Scaffold(
      backgroundColor: AppConstants.backgroundColor,
      body: Center(
        child: Text(
          'Sección ${sectionIndex ?? 'desconocida'} en construcción',
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w500,
            color: Color(0xff343b45),
          ),
        ),
      ),
    );
  }

  static int? _getSectionIndexFromName(String? name) {
    if (name == null) return null;

    // Puedes expandir esta lógica según necesites
    switch (name) {
      case '/':
        return 1;
      case '/suppliers':
        return 2;
      case '/purchases':
        return 3;
      case '/sales':
        return 4;
      case '/clients':
        return 4;
      case '/profile':
        return 5;
      default:
        return null;
    }
  }

  static List<GlobalKey<NavigatorState>> createNavigatorKeys() {
    return List.generate(
      navigationItemCount,
      (_) => GlobalKey<NavigatorState>(),
    );
  }

  static List<BottomNavigationBarItem> getNavigationItems() {
    return const [
      BottomNavigationBarItem(
        icon: Icon(Icons.shopping_bag),
        label: 'Productos',
      ),
      BottomNavigationBarItem(
        icon: Icon(Icons.local_shipping),
        label: 'Proveedores',
      ),
      BottomNavigationBarItem(
        icon: Icon(Icons.shopping_cart),
        label: 'Compras',
      ),
      BottomNavigationBarItem(icon: Icon(Icons.point_of_sale), label: 'Ventas'),
      BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Clientes'),
      BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Perfil'),
    ];
  }
}
