import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { db } from '@/mock/db';
import { useSession } from '@/store/sessionStore';
import { GeoFeatureItem, GeoLayerType, GeoPointSource } from '@/types';
import {
  MapPin,
  Layers,
  Plus,
  AlertTriangle,
  Camera,
  Compass,
  Crosshair,
  ShieldAlert,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

const LAYER_CONFIG: Record<
  GeoLayerType,
  { label: string; color: string; bg: string; borderColor: string; icon: string }
> = {
  Accidents: {
    label: 'Accidents',
    color: '#EF4444',
    bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    borderColor: 'border-rose-400',
    icon: '💥',
  },
  Incidents: {
    label: 'Incidents HSE',
    color: '#F97316',
    bg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
    borderColor: 'border-orange-400',
    icon: '⚠️',
  },
  Plaintes: {
    label: 'Plaintes Riverains (MGP)',
    color: '#A855F7',
    bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
    borderColor: 'border-purple-400',
    icon: '🗣️',
  },
  Avancement: {
    label: 'Avancement PK',
    color: '#10B981',
    bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    borderColor: 'border-emerald-400',
    icon: '🛣️',
  },
  Inspections: {
    label: 'Inspections Terrain',
    color: '#0284C7',
    bg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    borderColor: 'border-sky-400',
    icon: '🔍',
  },
  Audits: {
    label: 'Audits Sécurité (ASR)',
    color: '#EAB308',
    bg: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
    borderColor: 'border-amber-400',
    icon: '📋',
  },
  Actions: {
    label: 'Actions Correctives',
    color: '#06B6D4',
    bg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
    borderColor: 'border-cyan-400',
    icon: '🛡️',
  },
};

export const CarteChantierOsmPage: React.FC = () => {
  const { currentUser } = useSession();
  const [geoFeatures, setGeoFeatures] = useState<GeoFeatureItem[]>(db.geoFeatures);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLot, setSelectedLot] = useState<string>('ALL');
  const [activeLayers, setActiveLayers] = useState<Record<GeoLayerType, boolean>>({
    Accidents: true,
    Incidents: true,
    Plaintes: true,
    Avancement: true,
    Inspections: true,
    Audits: true,
    Actions: true,
  });

  const [selectedFeature, setSelectedFeature] = useState<GeoFeatureItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Formulaire d'ajout géoréférencé
  const [formLayer, setFormLayer] = useState<GeoLayerType>('Inspections');
  const [formTitle, setFormTitle] = useState('');
  const [formLot, setFormLot] = useState<'L01' | 'L02' | 'L03'>('L01');
  const [formPk, setFormPk] = useState('PK 05+200');
  const [formSource, setFormSource] = useState<GeoPointSource>('GPS_Smartphone');
  const [formLat, setFormLat] = useState('34.7812');
  const [formLng, setFormLng] = useState('10.6514');
  const [formAccuracy, setFormAccuracy] = useState('2.5');
  const [formSeverity, setFormSeverity] = useState<'Mineur' | 'Majeur' | 'Critique'>('Majeur');
  const [formDesc, setFormDesc] = useState('');
  const [formSensitive, setFormSensitive] = useState(false);

  const needContent: NeedPanelContent = {
    title: 'Section 15 : Carte OSM et pilotage géographique 2×2',
    purpose:
      "Cockpit cartographique interactif intégrant le linéaire du projet RN13 (PK 0 à 42) avec 7 couches métier. Les données privées de chantier restent strictement confinées dans la GED sécurisée sans publication externe sur OpenStreetMap.",
    actors: [
      { letter: 'B', actorName: 'Maître d\'Ouvrage (DGPC)', action: 'Supervision globale des blocages linéaires et avancement par PK' },
      { letter: 'D', actorName: 'Mission de Contrôle (SCET)', action: 'Relevé des non-conformités géolocalisées et validation des réceptions' },
      { letter: 'E', actorName: 'Entreprise (Soroubat/ETEP)', action: 'Suivi des déviations, levée des anomalies et déclarations terrain' },
      { letter: 'C', actorName: 'AMO & Experts Sécurité (Saiefeddine)', action: 'Audits ASR géotaggés, inspections nocturnes et points noirs' },
    ],
    donorRequirement:
      'Exigence BEI Norme 9 & BM NES 4 (Sécurité usagers et riverains) : Traçabilité précise de la localisation des incidents, signalisation de déviation et traitement des plaintes le long du corridor.',
    seeAlso: [
      { label: 'Sécurité Routière & SST', href: '/securite-routiere' },
      { label: 'Arrêts & Blocages Linéaires', href: '/execution/blocages' },
      { label: 'Bordereaux de Transmission', href: '/bordereaux-transmission' },
    ],
  };

  const toggleLayer = (layer: GeoLayerType) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const filteredFeatures = useMemo(() => {
    return geoFeatures.filter((f) => {
      if (!activeLayers[f.layer]) return false;
      if (selectedLot !== 'ALL' && f.lotId !== selectedLot) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = f.title.toLowerCase().includes(q);
        const matchPk = f.pk.toLowerCase().includes(q);
        const matchDesc = f.description.toLowerCase().includes(q);
        return matchTitle || matchPk || matchDesc;
      }
      return true;
    });
  }, [geoFeatures, activeLayers, selectedLot, searchQuery]);

  const handleSimulateGps = () => {
    // Coordonnées approximatives le long de la RN13 en Tunisie
    const pkNum = parseFloat(formPk.replace(/[^0-9.]/g, '')) || 5;
    const baseLat = 34.75 + (pkNum / 42) * 0.25;
    const baseLng = 10.7 - (pkNum / 42) * 0.9;
    setFormLat(baseLat.toFixed(4));
    setFormLng(baseLng.toFixed(4));
    setFormAccuracy((1.5 + Math.random() * 2).toFixed(1));
    toast.info(`Position GPS calculée pour le ${formPk} : ±${formAccuracy}m`);
  };

  const handleCreateFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Veuillez renseigner un titre explicite');
      return;
    }

    const newFeat: GeoFeatureItem = {
      id: `GEO-${Date.now().toString(36).toUpperCase()}`,
      layer: formLayer,
      title: formTitle,
      lotId: formLot,
      pk: formPk,
      lat: parseFloat(formLat) || 34.7812,
      lng: parseFloat(formLng) || 10.6514,
      accuracyMeters: parseFloat(formAccuracy) || 3.0,
      source: formSource,
      date: new Date().toISOString().slice(0, 10),
      severity: formSeverity,
      status: 'En_Traitement',
      description: formDesc || 'Constat géoréférencé sur le chantier RN13.',
      isSensitive: formSensitive,
      responsibleOrg: currentUser.actorLabel,
    };

    db.addGeoFeature(newFeat, currentUser);
    setGeoFeatures([...db.geoFeatures]);
    setIsNewModalOpen(false);
    setFormTitle('');
    setFormDesc('');
    toast.success(`Événement cartographique ajouté sur le ${formPk} (${formLayer})`);
  };

  const handleUpdateStatus = (featId: string, newStatus: any) => {
    db.updateGeoFeatureStatus(featId, newStatus, currentUser);
    setGeoFeatures([...db.geoFeatures]);
    if (selectedFeature && selectedFeature.id === featId) {
      setSelectedFeature({ ...selectedFeature, status: newStatus });
    }
    toast.success('Statut de l\'élément cartographique mis à jour');
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Carte OSM & Pilotage Géographique du Chantier 2×2"
          subtitle="Suivi spatialisé en temps réel sur le linéaire RN13 (PK 0+000 à 42+000) : 7 couches métiers, précision GPS/EXIF et rattachement documentaire."
          actions={
            <Button
              onClick={() => setIsNewModalOpen(true)}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Nouveau Constat Géo-référencé
            </Button>
          }
        />

        {/* Barre des 7 Couches Métiers */}
        <Card className="border border-border shadow-xs bg-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Layers className="h-4 w-4 text-primary" />
                Filtrer par Couches Métier (7 Couches) :
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Lot :</span>
                <select
                  value={selectedLot}
                  onChange={(e) => setSelectedLot(e.target.value)}
                  className="text-xs border border-border rounded-md px-2.5 py-1.5 bg-background text-foreground focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">Tous les Lots (PK 0 à 42)</option>
                  <option value="L01">Lot 1 (PK 00+000 à 14+000 - Sfax)</option>
                  <option value="L02">Lot 2 (PK 14+000 à 28+000 - Menzel Chaker)</option>
                  <option value="L03">Lot 3 (PK 28+000 à 42+000 - Sidi Bouzid)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {(Object.keys(LAYER_CONFIG) as GeoLayerType[]).map((layer) => {
                const conf = LAYER_CONFIG[layer];
                const count = geoFeatures.filter((f) => f.layer === layer).length;
                const isActive = activeLayers[layer];
                return (
                  <button
                    key={layer}
                    type="button"
                    onClick={() => toggleLayer(layer)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      isActive
                        ? `${conf.bg} ${conf.borderColor} shadow-xs ring-1 ring-primary/20`
                        : 'bg-muted/40 text-muted-foreground border-transparent opacity-60 hover:opacity-90'
                    }`}
                  >
                    <span>{conf.icon}</span>
                    <span>{conf.label}</span>
                    <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-background/80 font-bold">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Conteneur Cartographique Leaflet OSM */}
        <Card className="border border-border shadow-sm overflow-hidden bg-card">
          <CardHeader className="p-4 pb-2 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-bold">
                Tracé Satellitaire & Vecteur RN13 (Tunisie) - Fond OpenStreetMap
              </CardTitle>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {filteredFeatures.length} points affichés
              </span>
              <span>•</span>
              <span>Attribution © OpenStreetMap</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[460px] w-full relative z-0">
              <MapContainer
                center={[34.82, 10.35]}
                zoom={10}
                scrollWheelZoom={true}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {filteredFeatures.map((feat) => {
                  const conf = LAYER_CONFIG[feat.layer];
                  return (
                    <CircleMarker
                      key={feat.id}
                      center={[feat.lat, feat.lng]}
                      radius={feat.severity === 'Critique' || feat.severity === 'Mortel' ? 12 : 9}
                      pathOptions={{
                        color: '#FFFFFF',
                        weight: 2,
                        fillColor: conf.color,
                        fillOpacity: 0.85,
                      }}
                      eventHandlers={{
                        click: () => setSelectedFeature(feat),
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                        <div className="text-xs font-sans">
                          <p className="font-bold text-foreground">
                            {conf.icon} {feat.pk} : {feat.title}
                          </p>
                          <p className="text-muted-foreground text-[10px]">
                            {conf.label} • {feat.severity || 'Normal'}
                          </p>
                        </div>
                      </Tooltip>

                      <Popup>
                        <div className="p-1 space-y-2 max-w-xs font-sans text-xs">
                          <div className="flex items-center justify-between gap-2 border-b pb-1">
                            <span className="font-extrabold text-primary">{feat.pk}</span>
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                              style={{ backgroundColor: `${conf.color}20`, color: conf.color }}
                            >
                              {conf.label}
                            </span>
                          </div>

                          <p className="font-bold text-foreground text-xs leading-tight">
                            {feat.title}
                          </p>

                          <p className="text-muted-foreground text-[11px] leading-relaxed">
                            {feat.description}
                          </p>

                          <div className="bg-muted/50 p-1.5 rounded text-[10px] space-y-0.5 text-muted-foreground">
                            <div className="flex justify-between">
                              <span>Source :</span>
                              <span className="font-semibold text-foreground">
                                {feat.source.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Précision :</span>
                              <span className="font-semibold text-foreground">
                                ±{feat.accuracyMeters} m
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Statut :</span>
                              <span className="font-bold text-primary">
                                {feat.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>

                          <div className="pt-1 flex gap-2">
                            <Button
                              size="sm"
                              className="h-7 text-xs w-full"
                              onClick={() => setSelectedFeature(feat)}
                            >
                              Fiche Détaillée
                            </Button>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tableau / Registre des Événements Cartographiques */}
        <Card className="border border-border shadow-xs bg-card">
          <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold">
                Registre des Éléments Géolocalisés le long de la RN13
              </CardTitle>
              <CardDescription className="text-xs">
                Données d'acquisition GPS, conformité CCTP et avancement physique par point kilométrique
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par PK, titre, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8 w-64 bg-background"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3">Couche & PK</th>
                    <th className="py-2.5 px-3">Titre & Constat</th>
                    <th className="py-2.5 px-3">Lot</th>
                    <th className="py-2.5 px-3">Acquisition</th>
                    <th className="py-2.5 px-3">Gravité</th>
                    <th className="py-2.5 px-3">Statut</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredFeatures.map((feat) => {
                    const conf = LAYER_CONFIG[feat.layer];
                    return (
                      <tr
                        key={feat.id}
                        className="hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => setSelectedFeature(feat)}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: conf.color }}
                            />
                            <div>
                              <span className="font-extrabold text-foreground block">
                                {feat.pk}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {conf.label}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <p className="font-medium text-foreground truncate">{feat.title}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {feat.description}
                          </p>
                          {feat.isSensitive && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-bold mt-0.5">
                              <Lock className="h-3 w-3" /> Confidentiel Loi 2004-63
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {feat.lotId}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-[11px]">
                            <span className="text-foreground font-medium block">
                              {feat.source.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              ±{feat.accuracyMeters}m ({feat.lat.toFixed(4)}, {feat.lng.toFixed(4)})
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            className={`text-[10px] font-bold ${
                              feat.severity === 'Critique' || feat.severity === 'Mortel'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                : feat.severity === 'Grave' || feat.severity === 'Majeur'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {feat.severity || 'Normal'}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-semibold bg-primary/10 text-primary border-primary/20"
                          >
                            {feat.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFeature(feat);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Détails
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Modal Détails d'un Élément Cartographique */}
        {selectedFeature && (
          <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wide"
                    style={{
                      backgroundColor: `${LAYER_CONFIG[selectedFeature.layer].color}20`,
                      color: LAYER_CONFIG[selectedFeature.layer].color,
                    }}
                  >
                    {LAYER_CONFIG[selectedFeature.layer].label}
                  </span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {selectedFeature.pk}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    Lot {selectedFeature.lotId}
                  </span>
                </div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {selectedFeature.title}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Enregistré le {selectedFeature.date} par {selectedFeature.responsibleOrg || 'Chantier RN13'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                <div className="p-3 bg-muted/40 rounded-lg space-y-2 border border-border">
                  <p className="font-semibold text-foreground">Description du constat :</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedFeature.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-background rounded-md border border-border space-y-1">
                    <span className="text-muted-foreground text-[10px] block">Source & Précision</span>
                    <span className="font-bold text-foreground block">
                      {selectedFeature.source.replace('_', ' ')} (±{selectedFeature.accuracyMeters} m)
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Lat: {selectedFeature.lat} | Lng: {selectedFeature.lng}
                    </span>
                  </div>

                  <div className="p-2.5 bg-background rounded-md border border-border space-y-1">
                    <span className="text-muted-foreground text-[10px] block">Rattachement Documentaire</span>
                    <span className="font-bold text-primary block">
                      {selectedFeature.linkedDocCode || 'Dossier lié : CCTP Lot 01'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Axe géométrique RN13 Version R02
                    </span>
                  </div>
                </div>

                {selectedFeature.quantityPlanned && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-lg">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs block mb-1">
                      Métriques d'avancement physique :
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Prévu</span>
                        <span className="font-black text-foreground">
                          {selectedFeature.quantityPlanned} {selectedFeature.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Exécuté</span>
                        <span className="font-black text-blue-600">
                          {selectedFeature.quantityExecuted} {selectedFeature.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Accepté Mission Contrôle</span>
                        <span className="font-black text-emerald-600">
                          {selectedFeature.quantityAccepted} {selectedFeature.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex items-center justify-between sm:justify-between border-t border-border pt-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => handleUpdateStatus(selectedFeature.id, 'Cloture_Verifie')}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                    Valider / Clôturer
                  </Button>
                </div>
                <Button size="sm" onClick={() => setSelectedFeature(null)} className="text-xs">
                  Fermer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal Création Nouvel Événement Géoréférencé */}
        <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Signaler un Nouvel Événement Géolocalisé
              </DialogTitle>
              <DialogDescription className="text-xs">
                Acquisition terrain conforme aux standards RN13 (GPS smartphone, EXIF ou sélection carte)
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateFeature} className="space-y-3.5 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Couche Métier</label>
                  <select
                    value={formLayer}
                    onChange={(e) => setFormLayer(e.target.value as GeoLayerType)}
                    className="w-full border border-border rounded-md px-2.5 py-1.5 bg-background text-foreground text-xs"
                  >
                    {(Object.keys(LAYER_CONFIG) as GeoLayerType[]).map((l) => (
                      <option key={l} value={l}>
                        {LAYER_CONFIG[l].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">Lot du Projet</label>
                  <select
                    value={formLot}
                    onChange={(e) => setFormLot(e.target.value as any)}
                    className="w-full border border-border rounded-md px-2.5 py-1.5 bg-background text-foreground text-xs"
                  >
                    <option value="L01">Lot 1 (PK 0 à 14)</option>
                    <option value="L02">Lot 2 (PK 14 à 28)</option>
                    <option value="L03">Lot 3 (PK 28 à 42)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Titre du Constat / Événement
                </label>
                <Input
                  required
                  placeholder="Ex: Signalisation dégradée, accident matériel, dalot coulé..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="text-xs bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Point Kilométrique (PK)
                  </label>
                  <Input
                    required
                    placeholder="Ex: PK 08+400"
                    value={formPk}
                    onChange={(e) => setFormPk(e.target.value)}
                    className="text-xs bg-background font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">Mode d'Acquisition</label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value as any)}
                    className="w-full border border-border rounded-md px-2.5 py-1.5 bg-background text-foreground text-xs"
                  >
                    <option value="GPS_Smartphone">GPS Téléphone / Tablette</option>
                    <option value="Photo_EXIF">Coordonnées EXIF Photo</option>
                    <option value="Selection_Carte">Position Choisie sur Carte</option>
                  </select>
                </div>
              </div>

              {/* Coordonnées & Précision */}
              <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-[11px]">
                    Coordonnées WGS84 & Précision Métrique :
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSimulateGps}
                    className="h-6 text-[11px] gap-1 px-2"
                  >
                    <Crosshair className="h-3 w-3 text-primary" />
                    Calculer par PK
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Latitude</span>
                    <Input
                      value={formLat}
                      onChange={(e) => setFormLat(e.target.value)}
                      className="text-xs h-7 font-mono bg-background"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Longitude</span>
                    <Input
                      value={formLng}
                      onChange={(e) => setFormLng(e.target.value)}
                      className="text-xs h-7 font-mono bg-background"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Précision (m)</span>
                    <Input
                      value={formAccuracy}
                      onChange={(e) => setFormAccuracy(e.target.value)}
                      className="text-xs h-7 font-mono bg-background"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Description Détaillée</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Circonstances, mesures d'urgence, entreprises impliquées..."
                  className="w-full border border-border rounded-md p-2 bg-background text-foreground text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sensib"
                  checked={formSensitive}
                  onChange={(e) => setFormSensitive(e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="sensib" className="text-xs text-muted-foreground cursor-pointer">
                  Dossier confidentiel / plainte sensible (anonymiser sur la carte générale selon Loi 2004-63)
                </label>
              </div>

              <DialogFooter className="pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewModalOpen(false)}
                  className="text-xs"
                >
                  Annuler
                </Button>
                <Button type="submit" className="text-xs bg-primary text-primary-foreground">
                  Enregistrer l'Événement
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <NeedPanel content={needContent} />
    </div>
  );
};
