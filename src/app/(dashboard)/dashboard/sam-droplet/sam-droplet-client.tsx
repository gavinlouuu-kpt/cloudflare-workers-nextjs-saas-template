"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Zap, Filter, Eye, EyeOff, RotateCcw, RefreshCw, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MaskData {
  id: number;
  image: string;
  area: number;
  bbox: [number, number, number, number];
  stability_score: number;
  pixel_stats?: {
    mean_intensity: number;
    min_intensity: number;
    max_intensity: number;
    std_intensity: number;
    median_intensity: number;
  };
  edge_stats?: {
    min_distance_to_edge: number;
    touches_edge: boolean;
  };
}

interface FilterCriteria {
  mean_min?: number;
  mean_max?: number;
  min_threshold?: number;
  max_threshold?: number;
  std_min?: number;
  std_max?: number;
  area_min?: number;
  area_max?: number;
  min_edge_distance?: number;
  exclude_edge_touching?: boolean;
}

interface ImageAnalysis {
  overall_stats: {
    mean_intensity: number;
    min_intensity: number;
    max_intensity: number;
    std_intensity: number;
    median_intensity: number;
  };
  image_info: {
    width: number;
    height: number;
    channels: number;
    total_pixels: number;
  };
}

export function SamDropletClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [masks, setMasks] = useState<MaskData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hoveredMask, setHoveredMask] = useState<number | null>(null);
  const [showMaskOverlay, setShowMaskOverlay] = useState(true);
  const [colorMode, setColorMode] = useState(false);
  const [filteredMasks, setFilteredMasks] = useState<Set<number>>(new Set());
  const [showFilteredMasks, setShowFilteredMasks] = useState(false);
  const [filterHistory, setFilterHistory] = useState<number[]>([]);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const hoverCanvasRef = useRef<HTMLCanvasElement>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterCriteria>({});

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setMasks([]);
    setFilteredMasks(new Set());
    setFilterHistory([]);
    setImageAnalysis(null);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const processImage = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first.');
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      if (Object.keys(filters).length > 0) {
        formData.append('filters', JSON.stringify(filters));
      }

      const response = await fetch('/api/sam/segment', {
        method: 'POST',
        body: formData
      });

      const result = await response.json() as any;

      if (result.success) {
        setMasks(result.masks);
        toast.success(`Successfully generated ${result.num_masks} masks!`);
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (error) {
      toast.error('Cannot connect to server. Make sure it\'s running and accessible.');
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeImage = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/sam/analyze', {
        method: 'POST',
        body: formData
      });

      const result = await response.json() as any;

      if (result.success) {
        setImageAnalysis(result.analysis);
        toast.success('Image analysis complete!');
      } else {
        toast.error(`Analysis error: ${result.error}`);
      }
    } catch (error) {
      toast.error('Cannot connect to server for analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setImageAnalysis(null);
    toast.success('Filters cleared.');
  };

  const updateFilter = (key: keyof FilterCriteria, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  const toggleMaskFilter = (maskIndex: number) => {
    setFilteredMasks(prev => {
      const newFiltered = new Set(prev);
      if (newFiltered.has(maskIndex)) {
        newFiltered.delete(maskIndex);
        setFilterHistory(history => history.filter(h => h !== maskIndex));
      } else {
        newFiltered.add(maskIndex);
        setFilterHistory(history => [...history, maskIndex]);
      }
      return newFiltered;
    });
  };

  const undoLastFilter = () => {
    if (filterHistory.length > 0) {
      const lastFiltered = filterHistory[filterHistory.length - 1];
      setFilteredMasks(prev => {
        const newFiltered = new Set(prev);
        newFiltered.delete(lastFiltered);
        return newFiltered;
      });
      setFilterHistory(history => history.slice(0, -1));
    }
  };

  const resetInteractiveFilters = () => {
    setFilteredMasks(new Set());
    setFilterHistory([]);
    setShowFilteredMasks(false);
  };

  // Setup canvas when image loads or masks change
  useEffect(() => {
    if (imageRef.current && masks.length > 0) {
      setupCanvas();
      drawAllMasksOverlay();
    }
  }, [masks, showMaskOverlay, colorMode, filteredMasks, showFilteredMasks]);

  const setupCanvas = () => {
    const img = imageRef.current;
    const maskCanvas = maskCanvasRef.current;
    const hoverCanvas = hoverCanvasRef.current;
    
    if (!img || !maskCanvas || !hoverCanvas) return;

    const rect = img.getBoundingClientRect();
    const width = img.offsetWidth;
    const height = img.offsetHeight;

    [maskCanvas, hoverCanvas].forEach(canvas => {
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
    });
  };

  const generateMaskColors = (numMasks: number) => {
    const colors = [];
    for (let i = 0; i < numMasks; i++) {
      if (colorMode) {
        const hue = (i * 360 / numMasks) % 360;
        const saturation = 70 + (i % 3) * 10;
        const lightness = 50 + (i % 2) * 20;
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
      } else {
        colors.push('rgba(255, 0, 0, 0.3)');
      }
    }
    return colors;
  };

  const drawAllMasksOverlay = () => {
    const maskCanvas = maskCanvasRef.current;
    const img = imageRef.current;
    
    if (!maskCanvas || !img || !showMaskOverlay || masks.length === 0) {
      if (maskCanvas) {
        const ctx = maskCanvas.getContext('2d');
        ctx?.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      }
      return;
    }

    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

    const scaleX = maskCanvas.width / img.naturalWidth;
    const scaleY = maskCanvas.height / img.naturalHeight;
    const colors = generateMaskColors(masks.length);

    masks.forEach((mask, i) => {
      const [bx, by, bw, bh] = mask.bbox;
      const isFiltered = filteredMasks.has(i);

      if (isFiltered && !showFilteredMasks) return;

      let fillStyle = colors[i];
      let strokeStyle = colorMode ? colors[i].replace('0.3)', '0.8)') : 'rgba(255, 0, 0, 0.6)';

      if (isFiltered) {
        fillStyle = fillStyle.replace('0.3)', '0.1)');
        strokeStyle = 'rgba(128, 128, 128, 0.5)';
      }

      ctx.fillStyle = fillStyle;
      ctx.fillRect(bx * scaleX, by * scaleY, bw * scaleX, bh * scaleY);

      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = isFiltered ? 1 : 1;
      ctx.setLineDash(isFiltered ? [3, 3] : []);
      ctx.strokeRect(bx * scaleX, by * scaleY, bw * scaleX, bh * scaleY);

      if (isFiltered && showFilteredMasks) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(bx * scaleX, by * scaleY);
        ctx.lineTo((bx + bw) * scaleX, (by + bh) * scaleY);
        ctx.stroke();
        ctx.moveTo((bx + bw) * scaleX, by * scaleY);
        ctx.lineTo(bx * scaleX, (by + bh) * scaleY);
        ctx.stroke();
      }
    });
  };

  const handleImageMouseMove = (e: React.MouseEvent) => {
    const img = imageRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (img.naturalWidth / rect.width);
    const y = (e.clientY - rect.top) * (img.naturalHeight / rect.height);

    findMaskAtPosition(x, y);
  };

  const findMaskAtPosition = (x: number, y: number) => {
    let foundMaskIndex = -1;
    let smallestArea = Infinity;

    for (let i = 0; i < masks.length; i++) {
      const mask = masks[i];
      const isFiltered = filteredMasks.has(i);

      if (isFiltered && !showFilteredMasks) continue;

      const [bx, by, bw, bh] = mask.bbox;
      if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) {
        if (mask.area < smallestArea) {
          foundMaskIndex = i;
          smallestArea = mask.area;
        }
      }
    }

    if (foundMaskIndex !== hoveredMask) {
      setHoveredMask(foundMaskIndex !== -1 ? foundMaskIndex : null);
      if (foundMaskIndex !== -1) {
        highlightMaskOverlay(foundMaskIndex);
      } else {
        clearHoverOverlay();
      }
    }
  };

  const highlightMaskOverlay = (maskIndex: number) => {
    const hoverCanvas = hoverCanvasRef.current;
    const img = imageRef.current;
    
    if (!hoverCanvas || !img) return;

    const ctx = hoverCanvas.getContext('2d');
    if (!ctx) return;

    const mask = masks[maskIndex];
    ctx.clearRect(0, 0, hoverCanvas.width, hoverCanvas.height);

    const [bx, by, bw, bh] = mask.bbox;
    const scaleX = hoverCanvas.width / img.naturalWidth;
    const scaleY = hoverCanvas.height / img.naturalHeight;

    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(bx * scaleX, by * scaleY, bw * scaleX, bh * scaleY);

    ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
    ctx.fillRect(bx * scaleX, by * scaleY - 30, 100, 25);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`Mask #${maskIndex + 1}`, bx * scaleX + 5, by * scaleY - 10);
  };

  const clearHoverOverlay = () => {
    const hoverCanvas = hoverCanvasRef.current;
    if (hoverCanvas) {
      const ctx = hoverCanvas.getContext('2d');
      ctx?.clearRect(0, 0, hoverCanvas.width, hoverCanvas.height);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    const img = imageRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (img.naturalWidth / rect.width);
    const y = (e.clientY - rect.top) * (img.naturalHeight / rect.height);

    let clickedMaskIndex = -1;
    let smallestArea = Infinity;

    for (let i = 0; i < masks.length; i++) {
      const mask = masks[i];
      const [bx, by, bw, bh] = mask.bbox;
      if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) {
        if (mask.area < smallestArea) {
          clickedMaskIndex = i;
          smallestArea = mask.area;
        }
      }
    }

    if (clickedMaskIndex !== -1) {
      toggleMaskFilter(clickedMaskIndex);
    }
  };

  return (
    <div className="grid gap-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>
            Drag and drop an image here or click to select a file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center transition-colors",
              "hover:border-muted-foreground/50 cursor-pointer"
            )}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Drag and drop an image here or click to select
            </p>
            <Button variant="outline">
              Choose Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Image Preview and Process */}
      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Image</CardTitle>
            <CardDescription>{selectedFile.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-80 mx-auto rounded-lg shadow-lg"
              />
            </div>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={processImage} 
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                {isProcessing ? 'Processing...' : 'Generate Masks'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Panel */}
      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>
              Configure filtering criteria to refine mask detection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="intensity" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="intensity">Intensity</TabsTrigger>
                <TabsTrigger value="geometry">Geometry</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="intensity" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meanMin">Mean Intensity (Min)</Label>
                    <Input
                      id="meanMin"
                      type="number"
                      min="0"
                      max="255"
                      placeholder="0"
                      value={filters.mean_min || ''}
                      onChange={(e) => updateFilter('mean_min', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meanMax">Mean Intensity (Max)</Label>
                    <Input
                      id="meanMax"
                      type="number"
                      min="0"
                      max="255"
                      placeholder="255"
                      value={filters.mean_max || ''}
                      onChange={(e) => updateFilter('mean_max', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minThreshold">Darkest Pixel Threshold</Label>
                    <Input
                      id="minThreshold"
                      type="number"
                      min="0"
                      max="255"
                      placeholder="0"
                      value={filters.min_threshold || ''}
                      onChange={(e) => updateFilter('min_threshold', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxThreshold">Brightest Pixel Threshold</Label>
                    <Input
                      id="maxThreshold"
                      type="number"
                      min="0"
                      max="255"
                      placeholder="255"
                      value={filters.max_threshold || ''}
                      onChange={(e) => updateFilter('max_threshold', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stdMin">Texture/Variation (Min)</Label>
                    <Input
                      id="stdMin"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="0"
                      value={filters.std_min || ''}
                      onChange={(e) => updateFilter('std_min', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stdMax">Texture/Variation (Max)</Label>
                    <Input
                      id="stdMax"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="100"
                      value={filters.std_max || ''}
                      onChange={(e) => updateFilter('std_max', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="geometry" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="areaMin">Area (Min pixels)</Label>
                    <Input
                      id="areaMin"
                      type="number"
                      min="1"
                      placeholder="1"
                      value={filters.area_min || ''}
                      onChange={(e) => updateFilter('area_min', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="areaMax">Area (Max pixels)</Label>
                    <Input
                      id="areaMax"
                      type="number"
                      min="1"
                      placeholder="1000000"
                      value={filters.area_max || ''}
                      onChange={(e) => updateFilter('area_max', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minEdgeDistance">Min Edge Distance (pixels)</Label>
                    <Input
                      id="minEdgeDistance"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={filters.min_edge_distance || ''}
                      onChange={(e) => updateFilter('min_edge_distance', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excludeEdgeTouching">Exclude Edge-Touching</Label>
                    <Select
                      value={filters.exclude_edge_touching ? 'true' : ''}
                      onValueChange={(value) => updateFilter('exclude_edge_touching', value === 'true')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="No Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Filter</SelectItem>
                        <SelectItem value="true">Exclude Edge-Touching</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="analysis" className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    onClick={analyzeImage} 
                    disabled={isAnalyzing}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
                  </Button>
                  <Button 
                    onClick={processImage} 
                    disabled={isProcessing}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Apply Filters
                  </Button>
                  <Button 
                    onClick={clearFilters} 
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                </div>
                
                {imageAnalysis && (
                  <div className="p-4 bg-muted rounded-lg space-y-3">
                    <h4 className="font-medium">📈 Image Analysis Results</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Overall Statistics:</strong><br />
                        Mean: {imageAnalysis.overall_stats.mean_intensity.toFixed(1)}<br />
                        Range: {imageAnalysis.overall_stats.min_intensity} - {imageAnalysis.overall_stats.max_intensity}<br />
                        Median: {imageAnalysis.overall_stats.median_intensity.toFixed(1)}<br />
                        Std Dev: {imageAnalysis.overall_stats.std_intensity.toFixed(1)}
                      </div>
                      <div>
                        <strong>Image Info:</strong><br />
                        Size: {imageAnalysis.image_info.width} × {imageAnalysis.image_info.height}<br />
                        Channels: {imageAnalysis.image_info.channels}<br />
                        Total Pixels: {imageAnalysis.image_info.total_pixels.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm">
                      <strong>💡 Suggested filter ranges:</strong><br />
                      • Bright objects: Mean &gt; {(imageAnalysis.overall_stats.mean_intensity + imageAnalysis.overall_stats.std_intensity/2).toFixed(0)}<br />
                      • Dark objects: Mean &lt; {(imageAnalysis.overall_stats.mean_intensity - imageAnalysis.overall_stats.std_intensity/2).toFixed(0)}<br />
                      • High contrast: Std Dev &gt; {(imageAnalysis.overall_stats.std_intensity * 1.5).toFixed(1)}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {masks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Image Display */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Original Image (Hover to explore)</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={showMaskOverlay ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowMaskOverlay(!showMaskOverlay)}
                    className="flex items-center gap-2"
                  >
                    {showMaskOverlay ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {showMaskOverlay ? 'Hide All Masks' : 'Show All Masks'}
                  </Button>
                  <Button
                    variant={colorMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setColorMode(!colorMode)}
                  >
                    🌈 {colorMode ? 'Single Color' : 'Color Mode'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <div className="font-medium mb-2">🎯 Interactive Filtering</div>
                  <div className="text-sm text-muted-foreground mb-3">
                    Click on masks to hide false positives
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={undoLastFilter}
                      disabled={filterHistory.length === 0}
                      className="flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Undo Last
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilteredMasks(!showFilteredMasks)}
                      className="flex items-center gap-1"
                    >
                      {showFilteredMasks ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      {showFilteredMasks ? 'Hide Hidden' : 'Show Hidden'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetInteractiveFilters}
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Reset All
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {filteredMasks.size === 0
                      ? 'Click masks to filter them out'
                      : `${filteredMasks.size} mask(s) filtered • ${showFilteredMasks ? masks.length : masks.length - filteredMasks.size} visible`
                    }
                  </div>
                </div>
                
                <div className="relative border rounded-lg overflow-hidden">
                  <img
                    ref={imageRef}
                    src={previewUrl}
                    alt="Original"
                    className="w-full h-auto cursor-crosshair"
                    onMouseMove={handleImageMouseMove}
                    onMouseLeave={() => {
                      setHoveredMask(null);
                      clearHoverOverlay();
                    }}
                    onClick={handleImageClick}
                  />
                  <canvas
                    ref={maskCanvasRef}
                    className="absolute top-0 left-0 pointer-events-none opacity-40"
                  />
                  <canvas
                    ref={hoverCanvasRef}
                    className="absolute top-0 left-0 pointer-events-none opacity-30"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mask Preview Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Mask Preview</CardTitle>
                <CardDescription>
                  Found {masks.length} objects/regions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hoveredMask !== null ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <img
                        src={masks[hoveredMask].image}
                        alt={`Mask ${hoveredMask + 1}`}
                        className="max-w-full max-h-48 mx-auto rounded border"
                      />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div><strong>Mask ID:</strong> {hoveredMask + 1}</div>
                      <div><strong>Area:</strong> {masks[hoveredMask].area.toLocaleString()} pixels</div>
                      <div><strong>Confidence:</strong> {masks[hoveredMask].stability_score.toFixed(3)}</div>
                      <div><strong>Bounding Box:</strong> [{masks[hoveredMask].bbox.map(v => Math.round(v)).join(', ')}]</div>
                      
                      {masks[hoveredMask].pixel_stats && (
                        <div className="pt-2 border-t">
                          <strong>Pixel Statistics:</strong><br />
                          <div className="text-xs mt-1 space-y-1">
                            <div>Mean Intensity: {masks[hoveredMask].pixel_stats!.mean_intensity.toFixed(1)}</div>
                            <div>Range: {masks[hoveredMask].pixel_stats!.min_intensity} - {masks[hoveredMask].pixel_stats!.max_intensity}</div>
                            <div>Std Dev: {masks[hoveredMask].pixel_stats!.std_intensity.toFixed(1)}</div>
                          </div>
                        </div>
                      )}
                      
                      {masks[hoveredMask].edge_stats && (
                        <div className="pt-2 border-t">
                          <strong>Edge Proximity:</strong><br />
                          <div className="text-xs mt-1 space-y-1">
                            <div>Distance to Edge: {masks[hoveredMask].edge_stats!.min_distance_to_edge} px</div>
                            <div>Touches Edge: {masks[hoveredMask].edge_stats!.touches_edge ? 'Yes' : 'No'}</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-2 border-t">
                        <strong>Filter Status:</strong><br />
                        <div className="text-xs mt-1">
                          {filteredMasks.has(hoveredMask) ? (
                            <span className="text-red-600">🚫 Filtered Out</span>
                          ) : (
                            <span className="text-green-600">✅ Visible</span>
                          )}
                          <br />
                          <em className="text-muted-foreground">Click to toggle filter</em>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground italic py-12">
                    Hover over the image to preview masks
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
} 