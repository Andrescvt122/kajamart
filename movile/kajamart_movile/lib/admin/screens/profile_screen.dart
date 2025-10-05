// lib/screens/profile_screen.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../constants/app_constants.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
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
  void dispose() {
    _nameController.dispose();
    _roleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConstants.backgroundColor,
      appBar: AppBar(
        title: Text(
          "Mi Perfil",
          style: TextStyle(
            color: AppConstants.textDarkColor,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: AppConstants.secondaryColor,
        elevation: 0,
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(
              _isEditing ? Icons.save : Icons.edit,
              color: AppConstants.textDarkColor,
            ),
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
              backgroundColor: AppConstants.secondaryColor.withOpacity(0.5),
              child: Icon(
                Icons.person,
                size: 80,
                color: AppConstants.textDarkColor,
              ),
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
        prefixIcon: Icon(icon, color: AppConstants.textLightColor),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        filled: !_isEditing,
        fillColor: AppConstants.secondaryColor.withOpacity(0.2),
        disabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppConstants.secondaryColor),
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
        color: _isEditing
            ? Colors.transparent
            : AppConstants.secondaryColor.withOpacity(0.2),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(
                Icons.power_settings_new,
                color: AppConstants.textLightColor,
              ),
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
            activeColor: AppConstants.primaryColor,
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
        Icon(icon, color: AppConstants.textLightColor),
        const SizedBox(width: 16),
        Text(
          "$label:",
          style: TextStyle(fontSize: 16, color: AppConstants.textDarkColor),
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
