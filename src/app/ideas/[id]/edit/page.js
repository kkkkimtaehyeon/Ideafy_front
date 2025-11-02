"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import api from "@/app/common/api-axios";

export default function EditIdeaPage() {
  const router = useRouter();
  const params = useParams();
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stages, setStages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // URL 입력 관련 상태
  const [urlAlias, setUrlAlias] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [urls, setUrls] = useState({}); // { alias: url }

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    category: '',
    stage: '',
    problem: '',
    solution: '',
    targetUser: '',
    feedback: '',
    revenueModel: '',
    techStacks: '',
    alternatives: '',
    
  });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage = {
          id: Date.now() + index,
          file: file,
          preview: event.target.result,
          description: '',
          name: file.name
        };
        setImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDescriptionChange = (id, description) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, description } : img
    ));
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleAddUrl = () => {
    if (!urlAlias.trim() || !urlValue.trim()) return;
    setUrls(prev => ({
      ...prev,
      [urlAlias]: urlValue
    }));
    setUrlAlias("");
    setUrlValue("");
  };
  const handleRemoveUrl = (alias) => {
    setUrls(prev => {
      const newUrls = { ...prev };
      delete newUrls[alias];
      return newUrls;
    });
  };

  // 카테고리와 스테이지 데이터 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get('/idea-categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    const loadStages = async () => {
      try {
        const response = await api.get('/idea-stages');
        setStages(response.data);
      } catch (error) {
        console.error('Failed to load stages:', error);
      }
    };

    loadCategories();
    loadStages();
  }, []);

  // 아이디어 데이터 로드
  useEffect(() => {
    const loadIdea = async () => {
      if (!params.id) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/ideas/${params.id}`);
        const idea = response.data;

        // 폼 데이터 설정
        setFormData({
          title: idea.title || '',
          summary: idea.summary || '',
          category: idea.category || '',
          stage: idea.stage || '',
          problem: idea.problem || '',
          solution: idea.solution || '',
          targetUser: idea.targetUser || '',
          feedback: idea.feedback || '',
          revenueModel: idea.revenueModel || '',
          techStacks: idea.techStacks || '',
          alternatives: idea.alternatives || '',
          
        });

        // URL 데이터 설정
        if (idea.urls && typeof idea.urls === 'object') {
          setUrls(idea.urls);
        }

        // 이미지 데이터 설정 (기존 attachments를 이미지 형식으로 변환)
        if (idea.attachments && Array.isArray(idea.attachments)) {
          const existingImages = idea.attachments.map((attachment, index) => ({
            id: attachment.id || Date.now() + index,
            file: null, // 기존 이미지는 파일 객체가 없음
            fileUrl: attachment.fileUrl, // fileUrl 저장
            preview: attachment.fileUrl,
            description: attachment.description || '',
            name: attachment.fileName || `image-${index + 1}`,
            isExisting: true // 기존 이미지 표시
          }));
          setImages(existingImages);
        }
      } catch (error) {
        console.error('Failed to load idea:', error);
        alert('아이디어 정보를 불러오는데 실패했습니다.');
        router.push(`/ideas/${params.id}`);
      } finally {
        setLoading(false);
      }
    };

    loadIdea();
  }, [params.id, router]);

  // 폼 데이터 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // 새로 업로드한 이미지만 필터링
      const newImages = images.filter(img => img.file);
      const existingImages = images.filter(img => !img.file && img.isExisting);

      // JSON 데이터 추가
      const ideaData = {
        title: formData.title,
        summary: formData.summary,
        category: formData.category.toUpperCase(),
        stage: formData.stage.toUpperCase(),
        problem: formData.problem,
        solution: formData.solution,
        targetUser: formData.targetUser,
        feedback: formData.feedback,
        revenueModel: formData.revenueModel,
        techStacks: formData.techStacks,
        alternatives: formData.alternatives,
        urls: urls,
        attachments: existingImages.map(img => ({
          id: img.id,
          fileUrl: img.fileUrl,
          description: img.description
        })).filter(item => item.id && item.fileUrl),
        fileMetadatas: newImages.map(img => ({
          description: img.description
        }))
      };

      formDataToSend.append(
        "data",
        new Blob([JSON.stringify(ideaData)], { type: "application/json" })
      );

      // 새로 업로드한 파일들만 추가
      newImages.forEach(img => {
        if (img.file) {
          formDataToSend.append('files', img.file);
        }
      });

      const response = await api.put(`/ideas/${params.id}`, formDataToSend);

      console.log('Idea updated successfully:', response.data);
      alert('아이디어가 수정되었습니다.');
      router.push(`/ideas/${params.id}`);
    } catch (error) {
      console.error('Failed to update idea:', error);
      alert('아이디어 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background-dark text-foreground-dark font-display">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex-grow">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-dark">Loading idea...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-foreground-dark font-display">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-3 bg-gradient-to-r from-red-500 to-blue-600 bg-clip-text text-transparent">Edit Your Idea</h2>
          </div>
          <form className="space-y-16" onSubmit={handleSubmit}>
            <section className="space-y-6">
              <div className="pb-4 border-b-2 border-subtle-dark">
                <h3 className="text-2xl font-bold tracking-tight flex items-center gap-3"><span className="material-symbols-outlined text-primary text-3xl">lightbulb</span> The Gist</h3>
                <p className="text-muted-dark mt-1">A quick summary to grab attention. Make it count!</p>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-dark" htmlFor="title">Title <span className="text-accent">*</span></label>
                  <input 
                    className="form-input w-full rounded-lg border-subtle-dark bg-subtle-dark focus:border-primary p-2" 
                    id="title" 
                    name="title" 
                    placeholder="e.g., AI-Powered Personal Chef App" 
                    type="text" 
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-dark" htmlFor="summary">Short Summary <span className="text-accent">*</span></label>
                  <textarea 
                    className="form-textarea w-full rounded-lg border-subtle-dark bg-subtle-dark focus:border-primary p-2" 
                    id="summary" 
                    name="summary" 
                    placeholder="A one-sentence pitch for your idea. What is it and who is it for?" 
                    rows={2}
                    value={formData.summary}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-dark" htmlFor="category">Category <span className="text-accent">*</span></label>
                    <div className="relative">
                      <select 
                        className="form-select w-full rounded-lg border-subtle-dark bg-subtle-dark focus:border-primary p-2 pr-10 appearance-none" 
                        id="category" 
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((category, index) => (
                          <option key={index} value={category}>{category}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="material-symbols-outlined text-muted-dark text-lg">keyboard_arrow_down</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-dark" htmlFor="stage">Stage <span className="text-accent">*</span></label>
                    <div className="relative">
                      <select 
                        className="form-select w-full rounded-lg border-subtle-dark bg-subtle-dark focus:border-primary p-2 pr-10 appearance-none" 
                        id="stage" 
                        name="stage"
                        value={formData.stage}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select the current stage</option>
                        {stages.map((stage, index) => (
                          <option key={index} value={stage}>{stage}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="material-symbols-outlined text-muted-dark text-lg">keyboard_arrow_down</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="pb-4 border-b-2 border-subtle-dark">
                <h3 className="text-2xl font-bold tracking-tight flex items-center gap-3"><span className="material-symbols-outlined text-primary text-3xl">target</span> Core Idea</h3>
                <p className="text-muted-dark mt-1">Describe the essence of your project. This is where you sell the vision.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-dark" htmlFor="problem">The Problem <span className="text-accent">*</span></label>
                  <textarea 
                    className="form-textarea w-full rounded-lg border-subtle-dark bg-subtle-dark focus:border-primary p-2" 
                    id="problem" 
                    name="problem" 
                    placeholder="What specific problem are you solving? Who faces this problem?" 
                    rows={5}
                    value={formData.problem}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-dark" htmlFor="solution">Your Solution <span className="text-accent">*</span></label>
                  <textarea 
                    className="form-textarea w-full rounded-lg border-subtle-dark bg-subtle-dark focus:border-primary p-2" 
                    id="solution" 
                    name="solution" 
                    placeholder="How does your idea solve this problem? What makes it unique?" 
                    rows={5}
                    value={formData.solution}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-dark" htmlFor="targetUser">Target Audience <span className="text-accent">*</span></label>
                  <textarea 
                    className="form-textarea w-full rounded-lg border-subtle-dark bg-subtle-dark focus:border-primary p-2" 
                    id="targetUser" 
                    name="targetUser" 
                    placeholder="Describe your ideal user. Be as specific as possible." 
                    rows={5}
                    value={formData.targetUser}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-dark" htmlFor="feedback">Desired Feedback <span className="text-accent">*</span></label>
                  <textarea 
                    className="form-textarea w-full rounded-lg border-subtle-dark bg-subtle-dark focus:border-primary p-2" 
                    id="feedback" 
                    name="feedback" 
                    placeholder="What questions do you have? What are you trying to validate?" 
                    rows={5}
                    value={formData.feedback}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="pb-4 border-b-2 border-subtle-dark">
                <h3 className="text-2xl font-bold tracking-tight flex items-center gap-3"><span className="material-symbols-outlined text-primary text-3xl">insights</span> Details <span className="text-sm font-normal text-muted-dark">(Optional)</span></h3>
                <p className="text-muted-dark mt-1">Provide more context for those who want to dig deeper.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-dark" htmlFor="revenueModel">Revenue Model</label>
                  <textarea 
                    className="form-textarea w-full rounded-lg border-subtle-dark bg-subtle-dark focus:border-primary p-2" 
                    id="revenueModel" 
                    name="revenueModel" 
                    placeholder="Subscription, one-time purchase, ads, etc." 
                    rows={4}
                    value={formData.revenueModel}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                {/* <div>
                  <label className="block text-sm font-medium mb-2 text-muted-dark" htmlFor="keyMetrics">Key Metrics</label>
                  <textarea 
                    className="form-textarea w-full rounded-lg border-subtle-dark bg-subtle-dark focus:border-primary p-2" 
                    id="keyMetrics" 
                    name="keyMetrics" 
                    placeholder="How will you measure success? (e.g., MAU, LTV, Churn)" 
                    rows={4}
                    value={formData.keyMetrics}
                    onChange={handleInputChange}
                  ></textarea>
                </div> */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-dark" htmlFor="techStacks">Potential Tech Stack</label>
                  <textarea 
                    className="form-textarea w-full rounded-lg border-subtle-dark bg-subtle-dark focus:border-primary p-2" 
                    id="techStacks" 
                    name="techStacks" 
                    placeholder="List any technologies you're considering." 
                    rows={4}
                    value={formData.techStacks}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-dark" htmlFor="alternatives">Competitors & Alternatives</label>
                  <textarea 
                    className="form-textarea w-full rounded-lg border-subtle-dark bg-subtle-dark focus:border-primary p-2" 
                    id="alternatives" 
                    name="alternatives" 
                    placeholder="Who else is in this space? How is your idea different?" 
                    rows={4}
                    value={formData.alternatives}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="pb-4 border-b-2 border-subtle-dark">
                <h3 className="text-2xl font-bold tracking-tight flex items-center gap-3"><span className="material-symbols-outlined text-primary text-3xl">image</span> Attachments <span className="text-sm font-normal text-muted-dark">(Optional)</span></h3>
                <p className="text-muted-dark mt-1">Upload images to showcase your idea. Add descriptions to help others understand each visual.</p>
                <p className="text-accent mt-2 text-sm font-medium">💡 The first image is used as a thumbnail.</p>
              </div>
              
              {/* Image Upload Area */}
              <div className="space-y-4">
                <div className="flex justify-center items-center w-full">
                  <label className="flex flex-col justify-center items-center w-full h-48 bg-subtle-dark rounded-xl border-2 border-dashed border-slate-600 cursor-pointer hover:bg-slate-800/60 transition" htmlFor="image-upload">
                    <div className="flex flex-col justify-center items-center pt-5 pb-6">
                      <span className="material-symbols-outlined text-5xl text-muted-dark mb-4">add_photo_alternate</span>
                      <p className="mb-2 text-sm text-muted-dark"><span className="font-semibold text-primary">Click to upload images</span> or drag and drop</p>
                      <p className="text-xs text-muted-dark">PNG, JPG, GIF up to 10MB each (Max 10 images)</p>
                    </div>
                    <input 
                      className="hidden" 
                      id="image-upload" 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                
                {/* Uploaded Images List */}
                <div className="space-y-4">
                  {images.length === 0 ? (
                    <div className="text-center text-muted-dark text-sm py-4">
                      No images uploaded yet. Upload some images to see them here.
                    </div>
                  ) : (
                    images.map((image) => (
                      <div key={image.id} className="bg-subtle-dark rounded-lg p-4 border border-slate-700">
                        <div className="flex gap-4">
                          {/* Image Preview */}
                          <div className="flex-shrink-0">
                            <img 
                              src={image.preview} 
                              alt={image.name}
                              className="w-24 h-24 object-cover rounded-lg border border-slate-600"
                            />
                          </div>
                          
                          {/* Image Details */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-slate-200 text-sm truncate">{image.name}</h4>
                              <button
                                type="button"
                                onClick={() => removeImage(image.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-muted-dark mb-1">
                                Image Description
                              </label>
                              <textarea
                                className="form-textarea w-full rounded-lg border-slate-600 bg-slate-800 focus:border-primary p-3 text-sm"
                                placeholder="Describe what this image shows..."
                                value={image.description}
                                onChange={(e) => handleDescriptionChange(image.id, e.target.value)}
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2 text-muted-dark">Related URLs</label>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col md:flex-row gap-2 items-stretch">
                        <input
                          className="form-input w-full rounded-lg border-subtle-dark bg-subtle-dark focus:border-primary p-2"
                          placeholder="Alias (e.g., Demo, GitHub, etc.)"
                          type="text"
                          value={urlAlias}
                          onChange={e => setUrlAlias(e.target.value)}
                        />
                        <input
                          className="form-input w-full rounded-lg border-subtle-dark bg-subtle-dark focus:border-primary p-2"
                          placeholder="https://url.example.com"
                          type="url"
                          value={urlValue}
                          onChange={e => setUrlValue(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={handleAddUrl}
                          className="bg-primary hover:bg-accent text-white rounded-lg px-4 py-2 font-semibold transition disabled:opacity-50"
                          disabled={!urlAlias.trim() || !urlValue.trim()}
                        >
                          +
                        </button>
                      </div>
                      {Object.keys(urls).length > 0 && (
                        <ul className="space-y-2 mt-2">
                          {Object.entries(urls).map(([alias, url]) => (
                            <li key={alias} className="flex items-center justify-between bg-background-dark rounded-lg px-3 py-2 border border-slate-700 text-sm">
                              <div>
                                <span className="font-bold text-accent mr-2">{alias}:</span>
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">{url}</a>
                              </div>
                              <button type="button" onClick={() => handleRemoveUrl(alias)} className="ml-3 text-red-400 hover:text-red-200 transition" title="삭제">
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
            </section>

            <div className="flex justify-end gap-4 pt-8 border-t border-subtle-dark">
              <button
                type="button"
                onClick={() => router.push(`/ideas/${params.id}`)}
                className="w-full md:w-auto cursor-pointer bg-slate-600 hover:bg-slate-700 text-white px-10 py-4 rounded-lg font-bold text-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="w-full md:w-auto cursor-pointer bg-gradient-to-r from-red-500 to-blue-600 text-white px-10 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    Edit
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}


