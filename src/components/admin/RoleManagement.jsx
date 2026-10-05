import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Copy,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Users,
  CheckSquare,
  Square,
  Lock,
  Sparkles,
  Info,
  X,
  Layers,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { PERMISSION_CATEGORIES, ROLE_TEMPLATES, ALL_PERMISSION_KEYS } from "../../constants/permissions";

export default function RoleManagement({ authToken, onToast, currentUser }) {
  // Data States
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Safe Deletion & Reassignment Modal State
  const [deletingRole, setDeletingRole] = useState(null);
  const [targetReassignRoleId, setTargetReassignRoleId] = useState("");
  const [reassigning, setReassigning] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "General",
    status: "active",
    permissions: []
  });
  const [dutySearch, setDutySearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [formError, setFormError] = useState("");

  const authHeaders = useMemo(() => {
    return {
      "Content-Type": "application/json",
      Authorization: authToken ? `Bearer ${authToken}` : "Bearer demo-token-admin"
    };
  }, [authToken]);

  // Role management specific permission helper
  const hasRolePerm = (permKey) => {
    if (!currentUser) return true;
    if (currentUser.isSuperAdmin || currentUser.role === "admin" || currentUser.role === "super_admin") return true;
    const perms = currentUser.permissions || [];
    if (perms.includes("*")) return true;
    return perms.includes(permKey);
  };

  // Load Roles
  const fetchRoles = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/roles", { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load roles list.");
      setRoles(data.roles || []);
    } catch (err) {
      if (onToast) onToast(err.message, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [authHeaders]);

  // Distinct Departments
  const departments = useMemo(() => {
    const set = new Set();
    roles.forEach((r) => {
      if (r.department) set.add(r.department);
    });
    return ["all", ...Array.from(set)];
  }, [roles]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        role.name.toLowerCase().includes(q) ||
        (role.description && role.description.toLowerCase().includes(q)) ||
        (role.department && role.department.toLowerCase().includes(q));

      const matchesDept = departmentFilter === "all" || role.department === departmentFilter;
      const matchesStatus = statusFilter === "all" || role.status === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [roles, searchQuery, departmentFilter, statusFilter]);

  // Metric Computations
  const metrics = useMemo(() => {
    const total = roles.length;
    const active = roles.filter((r) => r.status === "active").length;
    const assignedStaffCount = roles.reduce((sum, r) => sum + (r.staffCount || 0), 0);
    const customCount = roles.filter((r) => !r.isSystem).length;
    return { total, active, assignedStaffCount, customCount };
  }, [roles]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingRole(null);
    setFormData({
      name: "",
      description: "",
      department: "Front Desk",
      status: "active",
      permissions: []
    });
    setFormError("");
    setDutySearch("");
    // Expand top 3 categories by default
    setExpandedCategories({
      dashboard: true,
      students: true,
      staff: true
    });
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name || "",
      description: role.description || "",
      department: role.department || "General",
      status: role.status || "active",
      permissions: role.permissions || []
    });
    setFormError("");
    setDutySearch("");
    // Expand categories that contain selected duties
    const initialExpanded = {};
    PERMISSION_CATEGORIES.forEach((cat) => {
      const hasSelected = cat.permissions.some((p) => (role.permissions || []).includes(p.key) || (role.permissions || []).includes("*"));
      if (hasSelected) initialExpanded[cat.id] = true;
    });
    setExpandedCategories(initialExpanded);
    setIsFormOpen(true);
  };

  // Apply Pre-configured Template
  const handleApplyTemplate = (template) => {
    const targetPerms = template.suggestedPermissions.includes("*")
      ? ALL_PERMISSION_KEYS
      : template.suggestedPermissions;

    setFormData((prev) => ({
      ...prev,
      name: prev.name || template.name,
      description: prev.description || template.description,
      department: template.department || prev.department,
      permissions: targetPerms
    }));

    // Auto-expand relevant categories
    const newExpanded = {};
    PERMISSION_CATEGORIES.forEach((cat) => {
      const match = cat.permissions.some((p) => targetPerms.includes(p.key));
      if (match) newExpanded[cat.id] = true;
    });
    setExpandedCategories((prev) => ({ ...prev, ...newExpanded }));

    if (onToast) onToast(`Applied template duties for "${template.name}". You can customize before saving.`, "success");
  };

  // Toggle single duty
  const togglePermission = (key) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(key);
      const updated = exists ? prev.permissions.filter((p) => p !== key && p !== "*") : [...prev.permissions.filter((p) => p !== "*"), key];
      return { ...prev, permissions: updated };
    });
  };

  // Select all within a category
  const selectAllInCategory = (categoryId) => {
    const cat = PERMISSION_CATEGORIES.find((c) => c.id === categoryId);
    if (!cat) return;
    const catKeys = cat.permissions.map((p) => p.key);
    setFormData((prev) => {
      const current = new Set(prev.permissions.filter((p) => p !== "*"));
      catKeys.forEach((k) => current.add(k));
      return { ...prev, permissions: Array.from(current) };
    });
  };

  // Clear all within a category
  const clearCategory = (categoryId) => {
    const cat = PERMISSION_CATEGORIES.find((c) => c.id === categoryId);
    if (!cat) return;
    const catKeys = new Set(cat.permissions.map((p) => p.key));
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.filter((p) => !catKeys.has(p) && p !== "*")
    }));
  };

  // Toggle expand/collapse category
  const toggleCategoryExpand = (catId) => {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Save Role (Create or Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Role name is required.");
      return;
    }

    if (formData.permissions.length === 0) {
      if (!window.confirm("Notice: No duties are currently selected for this role. Are you sure you want to create a role with zero permissions?")) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const isEdit = !!editingRole;
      const url = isEdit ? `/api/roles/${editingRole.roleId}` : "/api/roles";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to save role.");

      if (onToast) onToast(data.message || `Role "${formData.name}" saved successfully!`, "success");
      setIsFormOpen(false);
      fetchRoles();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Duplicate Role
  const handleDuplicate = async (role) => {
    try {
      const res = await fetch(`/api/roles/${role.roleId}/duplicate`, {
        method: "POST",
        headers: authHeaders
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to duplicate role.");
      if (onToast) onToast(data.message || `Role "${role.name}" duplicated successfully.`, "success");
      fetchRoles();
    } catch (err) {
      if (onToast) onToast(err.message, "error");
    }
  };

  // Toggle Role Status (Activate / Deactivate)
  const handleToggleStatus = async (role) => {
    if (role.isSystem || role.roleId === "role-super-admin") {
      if (onToast) onToast("The built-in Super Admin role cannot be deactivated.", "error");
      return;
    }

    const newStatus = role.status === "active" ? "inactive" : "active";

    // If deactivating and staff are assigned, show warning
    if (newStatus === "inactive" && role.staffCount > 0) {
      const proceed = window.confirm(
        `Warning: Role "${role.name}" is currently assigned to ${role.staffCount} staff member(s).\n\nDeactivating this role will suspend operational duties for these employees until reassigned.\n\nDo you want to proceed with deactivation?`
      );
      if (!proceed) return;
    }

    try {
      const res = await fetch(`/api/roles/${role.roleId}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus, confirmed: true })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update role status.");
      if (onToast) onToast(data.message || `Role "${role.name}" status updated.`, "success");
      fetchRoles();
    } catch (err) {
      if (onToast) onToast(err.message, "error");
    }
  };

  // Initiate Role Deletion
  const handleDeleteClick = (role) => {
    if (role.isSystem || role.roleId === "role-super-admin") {
      if (onToast) onToast("The built-in Super Admin role is protected and cannot be deleted.", "error");
      return;
    }

    // If staff members are assigned, open safe reassignment modal!
    if (role.staffCount > 0) {
      const availableTargets = roles.filter((r) => r.roleId !== role.roleId && r.status === "active");
      setTargetReassignRoleId(availableTargets[0]?.roleId || "");
      setDeletingRole(role);
      return;
    }

    // Otherwise standard confirmation
    if (window.confirm(`Are you sure you want to permanently delete role "${role.name}"?\n\nThis action cannot be undone.`)) {
      performDirectDelete(role.roleId, role.name);
    }
  };

  // Direct Delete for unassigned role
  const performDirectDelete = async (roleId, roleName) => {
    try {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: "DELETE",
        headers: authHeaders
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete role.");
      if (onToast) onToast(`Role "${roleName}" deleted successfully.`, "success");
      fetchRoles();
    } catch (err) {
      if (onToast) onToast(err.message, "error");
    }
  };

  // Execute Safe Reassignment & Delete
  const handleReassignAndDelete = async (e) => {
    e.preventDefault();
    if (!targetReassignRoleId) {
      if (onToast) onToast("Please select a target role for reassignment.", "error");
      return;
    }

    setReassigning(true);
    try {
      const res = await fetch(`/api/roles/${deletingRole.roleId}/reassign-and-delete`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ targetRoleId: targetReassignRoleId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reassign and delete role.");
      if (onToast) onToast(data.message, "success");
      setDeletingRole(null);
      fetchRoles();
    } catch (err) {
      if (onToast) onToast(err.message, "error");
    } finally {
      setReassigning(false);
    }
  };

  // Duty Search Filter for Modal
  const filteredCategories = useMemo(() => {
    if (!dutySearch.trim()) return PERMISSION_CATEGORIES;
    const q = dutySearch.toLowerCase().trim();
    return PERMISSION_CATEGORIES.map((cat) => {
      const matching = cat.permissions.filter(
        (p) =>
          p.label.toLowerCase().includes(q) ||
          p.key.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
      return { ...cat, permissions: matching };
    }).filter((cat) => cat.permissions.length > 0);
  }, [dutySearch]);

  // Selected Duties Count in Form
  const isSuperSelected = formData.permissions.includes("*");
  const selectedDutiesCount = isSuperSelected ? ALL_PERMISSION_KEYS.length : formData.permissions.length;

  // Selected Category breakdown for Live Summary
  const selectedCategoriesSummary = useMemo(() => {
    if (isSuperSelected) return "Full System Clearance (All 15 Categories & All Duties)";
    const catMatches = [];
    PERMISSION_CATEGORIES.forEach((cat) => {
      const count = cat.permissions.filter((p) => formData.permissions.includes(p.key)).length;
      if (count > 0) catMatches.push(`${cat.name}: ${count}`);
    });
    return catMatches.length > 0 ? catMatches.join(" • ") : "No duties selected yet.";
  }, [formData.permissions, isSuperSelected]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      {/* ── Top Header & Summary ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          padding: "20px 24px",
          backgroundColor: "var(--color-surface)",
          borderRadius: "16px",
          border: "1px solid var(--color-border)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(235, 94, 40, 0.12)",
                color: "var(--color-accent, #EB5E28)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "var(--color-text-primary)" }}>
              Role & Duty Management
            </h2>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", margin: 0, maxWidth: "680px" }}>
            Configure granular institutional roles, assign suggested operational duties across 15 capability libraries,
            and enforce least-privilege security across staff members.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={fetchRoles}
            disabled={refreshing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 14px",
              borderRadius: "10px",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-background)",
              color: "var(--color-text-primary)",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          {hasRolePerm("admin.roles_create") && (
            <button
              onClick={handleOpenCreate}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 18px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "var(--color-accent, #EB5E28)",
                color: "#FFF",
                fontSize: "0.84rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(235, 94, 40, 0.28)"
              }}
            >
              <Plus size={16} />
              Create Custom Role
            </button>
          )}
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px"
        }}
      >
        {[
          { label: "Total Defined Roles", val: metrics.total, desc: "Configured roles", icon: ShieldCheck, color: "#3B82F6" },
          { label: "Active Roles", val: metrics.active, desc: "Assign-ready", icon: CheckCircle2, color: "#10B981" },
          { label: "Assigned Staff Members", val: metrics.assignedStaffCount, desc: "Total assigned", icon: Users, color: "#F59E0B" },
          { label: "Custom Staff Roles", val: metrics.customCount, desc: "Institute customized", icon: Sparkles, color: "#8B5CF6" }
        ].map((m, idx) => (
          <div
            key={idx}
            style={{
              padding: "16px 20px",
              backgroundColor: "var(--color-surface)",
              borderRadius: "14px",
              border: "1px solid var(--color-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", fontWeight: 600 }}>{m.label}</span>
              <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--color-text-primary)", marginTop: "4px" }}>
                {m.val}
              </div>
              <span style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>{m.desc}</span>
            </div>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: `${m.color}15`,
                color: m.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <m.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Search & Filter Controls ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          backgroundColor: "var(--color-surface)",
          borderRadius: "12px",
          border: "1px solid var(--color-border)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "var(--color-background)",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              padding: "8px 12px",
              flex: 1
            }}
          >
            <Search size={16} color="var(--color-text-secondary)" />
            <input
              type="text"
              placeholder="Search roles by title, department, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                width: "100%",
                color: "var(--color-text-primary)",
                fontSize: "0.82rem"
              }}
            />
            {searchQuery && (
              <X
                size={14}
                style={{ cursor: "pointer", color: "var(--color-text-secondary)" }}
                onClick={() => setSearchQuery("")}
              />
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>Dept:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-background)",
                color: "var(--color-text-primary)",
                fontSize: "0.8rem",
                outline: "none"
              }}
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === "all" ? "All Departments" : d}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-background)",
                color: "var(--color-text-primary)",
                fontSize: "0.8rem",
                outline: "none"
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Roles Table / Card List ── */}
      {loading ? (
        <div
          style={{
            padding: "48px",
            textAlign: "center",
            backgroundColor: "var(--color-surface)",
            borderRadius: "14px",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-secondary)"
          }}
        >
          <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px auto" }} />
          <p style={{ fontSize: "0.85rem", margin: 0 }}>Loading institutional role profiles...</p>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            backgroundColor: "var(--color-surface)",
            borderRadius: "14px",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-secondary)"
          }}
        >
          <ShieldAlert size={36} color="var(--color-text-secondary)" style={{ margin: "0 auto 12px auto", opacity: 0.6 }} />
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 6px 0", color: "var(--color-text-primary)" }}>
            No Matching Roles Found
          </h4>
          <p style={{ fontSize: "0.8rem", margin: "0 0 16px 0" }}>
            Try adjusting your search query or department filter, or create a new role.
          </p>
          {hasRolePerm("admin.roles_create") && (
            <button
              onClick={handleOpenCreate}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                backgroundColor: "var(--color-accent, #EB5E28)",
                color: "#FFF",
                border: "none",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Create New Role
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            borderRadius: "14px",
            border: "1px solid var(--color-border)",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                  <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Role Details</th>
                  <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Department</th>
                  <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Assigned Staff</th>
                  <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Access Level & Duties</th>
                  <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Status</th>
                  <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((role) => {
                  const isWildcard = (role.permissions || []).includes("*");
                  const dutiesCount = isWildcard ? ALL_PERMISSION_KEYS.length : (role.permissions || []).length;
                  const isSuper = role.isSystem || role.roleId === "role-super-admin";

                  return (
                    <tr
                      key={role.roleId}
                      style={{
                        borderBottom: "1px solid var(--color-border)",
                        transition: "background-color 0.15s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.015)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {/* 1. Name & Description */}
                      <td style={{ padding: "16px 18px", verticalAlign: "top", maxWidth: "260px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "var(--color-text-primary)" }}>
                            {role.name}
                          </span>
                          {isSuper && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                                padding: "2px 7px",
                                borderRadius: "6px",
                                backgroundColor: "rgba(16, 185, 129, 0.12)",
                                color: "#10B981",
                                fontSize: "0.68rem",
                                fontWeight: 700
                              }}
                              title="Built-in protected system role"
                            >
                              <Lock size={10} />
                              Protected System
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            fontSize: "0.76rem",
                            color: "var(--color-text-secondary)",
                            margin: 0,
                            lineHeight: "1.35",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical"
                          }}
                        >
                          {role.description || "No specific description provided."}
                        </p>
                      </td>

                      {/* 2. Department */}
                      <td style={{ padding: "16px 18px", verticalAlign: "top" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 9px",
                            borderRadius: "6px",
                            backgroundColor: "var(--color-background)",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-text-secondary)",
                            fontSize: "0.75rem",
                            fontWeight: 600
                          }}
                        >
                          {role.department || "General"}
                        </span>
                      </td>

                      {/* 3. Assigned Staff Members */}
                      <td style={{ padding: "16px 18px", verticalAlign: "top" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                          <Users size={14} color="var(--color-text-secondary)" />
                          <span
                            style={{
                              fontWeight: 700,
                              color: role.staffCount > 0 ? "var(--color-text-primary)" : "var(--color-text-secondary)"
                            }}
                          >
                            {role.staffCount || 0} {role.staffCount === 1 ? "Staff Member" : "Staff Members"}
                          </span>
                        </div>
                        {role.assignedStaff && role.assignedStaff.length > 0 && (
                          <div
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--color-text-secondary)",
                              lineHeight: "1.3"
                            }}
                          >
                            {role.assignedStaff
                              .slice(0, 2)
                              .map((s) => s.name)
                              .join(", ")}
                            {role.assignedStaff.length > 2 ? ` +${role.assignedStaff.length - 2} more` : ""}
                          </div>
                        )}
                      </td>

                      {/* 4. Access Level & Duties Breakdown */}
                      <td style={{ padding: "16px 18px", verticalAlign: "top", maxWidth: "260px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "6px",
                              backgroundColor: isWildcard ? "rgba(235, 94, 40, 0.12)" : "rgba(59, 130, 246, 0.12)",
                              color: isWildcard ? "var(--color-accent, #EB5E28)" : "#3B82F6",
                              fontWeight: 800,
                              fontSize: "0.74rem"
                            }}
                          >
                            {isWildcard ? "Full System Clearance (All)" : `${dutiesCount} Duties Authorized`}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--color-text-secondary)",
                            lineHeight: "1.35",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical"
                          }}
                        >
                          {isWildcard
                            ? "Complete administrative authorization across all 15 operational sectors."
                            : (role.permissions || []).slice(0, 4).join(", ") +
                              (role.permissions && role.permissions.length > 4 ? ` +${role.permissions.length - 4} more` : "")}
                        </div>
                      </td>

                      {/* 5. Status */}
                      <td style={{ padding: "16px 18px", verticalAlign: "top" }}>
                        <button
                          onClick={() => handleToggleStatus(role)}
                          disabled={isSuper || !hasRolePerm("admin.roles_deactivate")}
                          title={
                            isSuper
                              ? "Super Admin status is protected"
                              : !hasRolePerm("admin.roles_deactivate")
                              ? "Lacks permission to deactivate roles"
                              : "Click to toggle active status"
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "3px 9px",
                            borderRadius: "12px",
                            border: "none",
                            backgroundColor:
                              role.status === "active" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                            color: role.status === "active" ? "#10B981" : "#EF4444",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            cursor: isSuper || !hasRolePerm("admin.roles_deactivate") ? "not-allowed" : "pointer",
                            opacity: !hasRolePerm("admin.roles_deactivate") && !isSuper ? 0.6 : 1
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: role.status === "active" ? "#10B981" : "#EF4444"
                            }}
                          />
                          {role.status === "active" ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* 6. Actions */}
                      <td style={{ padding: "16px 18px", verticalAlign: "top", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                          {/* Duplicate */}
                          {hasRolePerm("admin.roles_create") && (
                            <button
                              onClick={() => handleDuplicate(role)}
                              title="Duplicate role as starting point"
                              style={{
                                padding: "6px 8px",
                                borderRadius: "6px",
                                border: "1px solid var(--color-border)",
                                backgroundColor: "var(--color-surface)",
                                color: "var(--color-text-secondary)",
                                cursor: "pointer"
                              }}
                            >
                              <Copy size={13} />
                            </button>
                          )}

                          {/* Edit */}
                          {hasRolePerm("admin.roles_edit") && (
                            <button
                              onClick={() => handleOpenEdit(role)}
                              title="Edit role details and duties"
                              style={{
                                padding: "6px 8px",
                                borderRadius: "6px",
                                border: "1px solid var(--color-border)",
                                backgroundColor: "var(--color-surface)",
                                color: "var(--color-text-primary)",
                                cursor: "pointer"
                              }}
                            >
                              <Edit2 size={13} />
                            </button>
                          )}

                          {/* Delete */}
                          {hasRolePerm("admin.roles_delete") && (
                            <button
                              onClick={() => handleDeleteClick(role)}
                              disabled={isSuper}
                              title={isSuper ? "Protected system role cannot be deleted" : "Delete role"}
                              style={{
                                padding: "6px 8px",
                                borderRadius: "6px",
                                border: "1px solid var(--color-border)",
                                backgroundColor: "var(--color-surface)",
                                color: isSuper ? "var(--color-text-secondary)" : "#EF4444",
                                opacity: isSuper ? 0.35 : 1,
                                cursor: isSuper ? "not-allowed" : "pointer"
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* ROLE CREATION / EDITING MODAL */}
      {/* ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {isFormOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "16px"
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              style={{
                backgroundColor: "var(--color-surface)",
                borderRadius: "18px",
                border: "1px solid var(--color-border)",
                width: "100%",
                maxWidth: "880px",
                maxHeight: "92vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
                overflow: "hidden"
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: "18px 24px",
                  borderBottom: "1px solid var(--color-border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "rgba(0,0,0,0.015)"
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: "0 0 3px 0", color: "var(--color-text-primary)" }}>
                    {editingRole ? `Edit Role: ${editingRole.name}` : "Create Custom Institutional Role"}
                  </h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                    Select specific duties from the 15 permission categories. No permissions are granted automatically.
                  </p>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-text-secondary)",
                    cursor: "pointer",
                    padding: "4px"
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <form
                onSubmit={handleSubmitForm}
                style={{
                  overflowY: "auto",
                  padding: "22px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px"
                }}
              >
                {formError && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#EF4444",
                      fontSize: "0.8rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* 1. Basic Fields */}
                <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "0.76rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                      Role Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Receptionist, Course Coordinator..."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        backgroundColor: "var(--color-background)",
                        color: "var(--color-text-primary)",
                        fontSize: "0.85rem"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.76rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                      Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Front Desk, Academics..."
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        backgroundColor: "var(--color-background)",
                        color: "var(--color-text-primary)",
                        fontSize: "0.85rem"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.76rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                      Status
                    </label>
                    <select
                      value={formData.status}
                      disabled={editingRole && (editingRole.isSystem || editingRole.roleId === "role-super-admin")}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        backgroundColor: "var(--color-background)",
                        color: "var(--color-text-primary)",
                        fontSize: "0.85rem"
                      }}
                    >
                      <option value="active">Active (Assignable to staff)</option>
                      <option value="inactive">Inactive (Deactivated)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.76rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe what duties and institutional areas this employee role is responsible for..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.82rem",
                      resize: "vertical"
                    }}
                  />
                </div>

                {/* 2. Starting Point Templates Selector */}
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(0,0,0,0.02)",
                    border: "1px solid var(--color-border)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    <Sparkles size={15} color="var(--color-accent, #EB5E28)" />
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                      Quick Template Starting Points (Optional):
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                      Click to pre-populate suggested duties, which you can then customize.
                    </span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {ROLE_TEMPLATES.map((tmpl) => (
                      <button
                        type="button"
                        key={tmpl.id}
                        onClick={() => handleApplyTemplate(tmpl)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "8px",
                          border: "1px solid var(--color-border)",
                          backgroundColor: "var(--color-surface)",
                          color: "var(--color-text-primary)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px"
                        }}
                      >
                        <span>{tmpl.name}</span>
                        <span style={{ fontSize: "0.68rem", opacity: 0.6 }}>({tmpl.suggestedPermissions.length})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Live Access Summary Bar */}
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(59, 130, 246, 0.08)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "8px"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#2563EB" }}>
                        Selected Access: {selectedDutiesCount} of {ALL_PERMISSION_KEYS.length} Total Institute Duties
                      </span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                      {selectedCategoriesSummary}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, permissions: ALL_PERMISSION_KEYS }))}
                      style={{
                        padding: "4px 9px",
                        borderRadius: "6px",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        backgroundColor: "var(--color-surface)",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      Select All Library
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, permissions: [] }))}
                      style={{
                        padding: "4px 9px",
                        borderRadius: "6px",
                        border: "1px solid var(--color-border)",
                        backgroundColor: "var(--color-surface)",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* 4. Duty Search Filter */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "var(--color-background)",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)"
                  }}
                >
                  <Search size={15} color="var(--color-text-secondary)" />
                  <input
                    type="text"
                    placeholder="Search specific duties (e.g. fees, attendance, inquiries, assignments)..."
                    value={dutySearch}
                    onChange={(e) => setDutySearch(e.target.value)}
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      width: "100%",
                      fontSize: "0.82rem",
                      color: "var(--color-text-primary)"
                    }}
                  />
                  {dutySearch && (
                    <X
                      size={14}
                      style={{ cursor: "pointer", color: "var(--color-text-secondary)" }}
                      onClick={() => setDutySearch("")}
                    />
                  )}
                </div>

                {/* 5. Categorized Duties Accordion / Checklist */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {filteredCategories.map((category) => {
                    const isExpanded = !!expandedCategories[category.id] || !!dutySearch.trim();
                    const totalInCat = category.permissions.length;
                    const selectedInCat = category.permissions.filter(
                      (p) => formData.permissions.includes(p.key) || isSuperSelected
                    ).length;

                    return (
                      <div
                        key={category.id}
                        style={{
                          borderRadius: "12px",
                          border: "1px solid var(--color-border)",
                          backgroundColor: "var(--color-surface)",
                          overflow: "hidden"
                        }}
                      >
                        {/* Category Header */}
                        <div
                          onClick={() => toggleCategoryExpand(category.id)}
                          style={{
                            padding: "12px 16px",
                            backgroundColor: "rgba(0,0,0,0.02)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            cursor: "pointer",
                            userSelect: "none"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            <span
                              style={{
                                width: "22px",
                                height: "22px",
                                borderRadius: "6px",
                                backgroundColor: "rgba(0,0,0,0.06)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.72rem",
                                fontWeight: 800
                              }}
                            >
                              {category.code}
                            </span>
                            <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--color-text-primary)" }}>
                              {category.name}
                            </span>
                            <span
                              style={{
                                fontSize: "0.72rem",
                                padding: "2px 7px",
                                borderRadius: "6px",
                                backgroundColor: selectedInCat > 0 ? "rgba(16, 185, 129, 0.12)" : "rgba(0,0,0,0.05)",
                                color: selectedInCat > 0 ? "#10B981" : "var(--color-text-secondary)",
                                fontWeight: 700
                              }}
                            >
                              {selectedInCat} / {totalInCat} Selected
                            </span>
                          </div>

                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: "flex", gap: "6px", alignItems: "center" }}
                          >
                            <button
                              type="button"
                              onClick={() => selectAllInCategory(category.id)}
                              style={{
                                padding: "3px 8px",
                                borderRadius: "5px",
                                border: "1px solid var(--color-border)",
                                backgroundColor: "var(--color-surface)",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                cursor: "pointer"
                              }}
                            >
                              Select All
                            </button>
                            <button
                              type="button"
                              onClick={() => clearCategory(category.id)}
                              style={{
                                padding: "3px 8px",
                                borderRadius: "5px",
                                border: "1px solid var(--color-border)",
                                backgroundColor: "var(--color-surface)",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                cursor: "pointer"
                              }}
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        {/* Category Body / Items */}
                        {isExpanded && (
                          <div
                            style={{
                              padding: "12px 16px",
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                              gap: "8px",
                              backgroundColor: "var(--color-background)"
                            }}
                          >
                            {category.permissions.map((perm) => {
                              const isChecked = formData.permissions.includes(perm.key) || isSuperSelected;

                              return (
                                <div
                                  key={perm.key}
                                  onClick={() => togglePermission(perm.key)}
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "10px",
                                    padding: "8px 10px",
                                    borderRadius: "8px",
                                    backgroundColor: isChecked ? "rgba(59, 130, 246, 0.06)" : "var(--color-surface)",
                                    border: isChecked ? "1px solid rgba(59, 130, 246, 0.25)" : "1px solid var(--color-border)",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease"
                                  }}
                                >
                                  <div style={{ marginTop: "2px" }}>
                                    {isChecked ? (
                                      <CheckSquare size={16} color="#2563EB" />
                                    ) : (
                                      <Square size={16} color="var(--color-text-secondary)" />
                                    )}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                      <span
                                        style={{
                                          fontSize: "0.78rem",
                                          fontWeight: isChecked ? 700 : 600,
                                          color: isChecked ? "var(--color-text-primary)" : "var(--color-text-secondary)"
                                        }}
                                      >
                                        {perm.label}
                                      </span>
                                      {perm.isSensitive && (
                                        <span
                                          style={{
                                            fontSize: "0.65rem",
                                            fontWeight: 700,
                                            padding: "1px 5px",
                                            borderRadius: "4px",
                                            backgroundColor: "rgba(245, 158, 11, 0.12)",
                                            color: "#D97706"
                                          }}
                                          title="Sensitive or administrative capability"
                                        >
                                          Sensitive
                                        </span>
                                      )}
                                    </div>
                                    <p
                                      style={{
                                        fontSize: "0.7rem",
                                        color: "var(--color-text-secondary)",
                                        margin: "2px 0 0 0",
                                        lineHeight: "1.3"
                                      }}
                                    >
                                      {perm.description}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Modal Footer Controls */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "14px",
                    borderTop: "1px solid var(--color-border)",
                    marginTop: "10px"
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Reset all form fields?")) {
                        setFormData({
                          name: "",
                          description: "",
                          department: "General",
                          status: "active",
                          permissions: []
                        });
                      }
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "transparent",
                      color: "var(--color-text-secondary)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Reset Form
                  </button>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      style={{
                        padding: "9px 18px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        backgroundColor: "var(--color-surface)",
                        color: "var(--color-text-primary)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        padding: "9px 24px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "var(--color-accent, #EB5E28)",
                        color: "#FFF",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: submitting ? "not-allowed" : "pointer",
                        boxShadow: "0 4px 12px rgba(235, 94, 40, 0.28)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      {submitting && <RefreshCw size={14} className="animate-spin" />}
                      {editingRole ? "Save Changes" : "Create Role"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════ */}
      {/* SAFE DELETION / REASSIGNMENT MODAL */}
      {/* ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {deletingRole && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1050,
              padding: "16px"
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                backgroundColor: "var(--color-surface)",
                borderRadius: "18px",
                border: "1px solid var(--color-border)",
                width: "100%",
                maxWidth: "520px",
                padding: "24px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.4)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", color: "#EF4444" }}>
                <AlertTriangle size={24} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--color-text-primary)" }}>
                  Role In Use: Safe Reassignment Required
                </h3>
              </div>

              <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", lineHeight: "1.4", margin: "0 0 16px 0" }}>
                Role <strong>"{deletingRole.name}"</strong> cannot be deleted directly because it is currently assigned
                to <strong>{deletingRole.staffCount} staff member(s)</strong>:
              </p>

              {/* Staff Member List Preview */}
              <div
                style={{
                  maxHeight: "120px",
                  overflowY: "auto",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-background)",
                  border: "1px solid var(--color-border)",
                  marginBottom: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}
              >
                {(deletingRole.assignedStaff || []).map((s) => (
                  <div key={s.staffId} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                    <span style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>{s.name}</span>
                    <span style={{ color: "var(--color-text-secondary)" }}>{s.staffId} • {s.designation}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleReassignAndDelete}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                  Select Replacement Active Role *
                </label>
                <select
                  required
                  value={targetReassignRoleId}
                  onChange={(e) => setTargetReassignRoleId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem",
                    marginBottom: "20px"
                  }}
                >
                  <option value="" disabled>Choose an active role...</option>
                  {roles
                    .filter((r) => r.roleId !== deletingRole.roleId && r.status === "active")
                    .map((r) => (
                      <option key={r.roleId} value={r.roleId}>
                        {r.name} ({r.department || "General"})
                      </option>
                    ))}
                </select>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setDeletingRole(null)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "transparent",
                      color: "var(--color-text-secondary)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={reassigning || !targetReassignRoleId}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#EF4444",
                      color: "#FFF",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      cursor: reassigning ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    {reassigning && <RefreshCw size={13} className="animate-spin" />}
                    Reassign Staff & Delete Role
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
