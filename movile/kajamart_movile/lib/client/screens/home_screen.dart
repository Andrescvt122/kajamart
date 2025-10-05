import 'package:flutter/material.dart';
import 'product_list_screen.dart';
import 'package:intl/intl.dart';
import '../pages/login_page.dart';
import 'category_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    ProductListScreen(),
    const CategoryScreen(),
    const ProfileScreen(),
  ];

  void _onItemTapped(int index) {
    if (index == 3) {
      // Navegar a la página de login y remover las rutas anteriores.
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (context) => const LoginPage()),
        (Route<dynamic> route) => false,
      );
    } else {
      setState(() {
        _selectedIndex = index;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.green,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.storefront),
            label: "Productos",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.category),
            label: "Categorías",
          ),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: "Perfil"),
          BottomNavigationBarItem(
            icon: Icon(Icons.exit_to_app),
            label: "Salir",
          ),
        ],
      ),
    );
  }
}

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isEditing = false;

  // Datos de ejemplo
  final TextEditingController _nameController = TextEditingController(
    text: "Alejandro",
  );
  final TextEditingController _roleController = TextEditingController(
    text: "Administrador",
  );
  final TextEditingController _descriptionController = TextEditingController(
    text:
        "Apasionado por el desarrollo de software y la creación de experiencias de usuario increíbles.",
  );
  bool _isActive = true;
  final DateTime _creationDate = DateTime(2023, 1, 15);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Mi Perfil"),
        backgroundColor: const Color.fromARGB(136, 135, 234, 129),
        actions: [
          IconButton(
            icon: Icon(_isEditing ? Icons.save : Icons.edit),
            onPressed: () {
              setState(() {
                _isEditing = !_isEditing;
              });
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 20),
            // Foto de perfil
            CircleAvatar(
              radius: 60,
              backgroundColor: Colors.grey.shade300,
              child: const Icon(Icons.person, size: 80, color: Colors.white),
            ),
            const SizedBox(height: 20),

            // Campos del perfil
            _buildTextField(
              controller: _nameController,
              label: "Nombre",
              icon: Icons.person_outline,
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _roleController,
              label: "Rol",
              icon: Icons.work_outline,
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _descriptionController,
              label: "Descripción",
              icon: Icons.description_outlined,
              maxLines: 3,
            ),
            const SizedBox(height: 20),

            // Estado
            _buildStatusSwitch(),
            const Divider(height: 40),

            // Fecha de creación
            _buildInfoRow(
              icon: Icons.calendar_today_outlined,
              label: "Fecha de Creación",
              value: DateFormat('dd/MM/yyyy').format(_creationDate),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    int maxLines = 1,
  }) {
    return TextField(
      controller: controller,
      enabled: _isEditing,
      maxLines: maxLines,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        filled: !_isEditing,
        fillColor: Colors.grey[200],
        disabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
      ),
    );
  }

  Widget _buildStatusSwitch() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade400),
        color: _isEditing ? Colors.transparent : Colors.grey[200],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(Icons.power_settings_new, color: Colors.grey.shade600),
              const SizedBox(width: 12),
              const Text("Estado", style: TextStyle(fontSize: 16)),
            ],
          ),
          Switch(
            value: _isActive,
            onChanged: _isEditing
                ? (value) {
                    setState(() {
                      _isActive = value;
                    });
                  }
                : null,
            activeColor: Colors.green,
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Icon(icon, color: Colors.grey.shade600),
        const SizedBox(width: 16),
        Text(
          "$label:",
          style: TextStyle(fontSize: 16, color: Colors.grey.shade700),
        ),
        const Spacer(),
        Text(
          value,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
