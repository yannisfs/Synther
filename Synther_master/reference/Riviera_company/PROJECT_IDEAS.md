# Project Ideas — Abstract Research Problems for Publication

This file lists **abstract research problems** that could be solved as
academic papers, technical articles, or conference talks. The point is
deliberately *not* applied case studies: none of these require a
specific customer, deployment, or industry context. Each problem is
stated in its general form, with a method that would solve it, and a
venue where the result would belong.

Why this framing:
- A theoretical contribution (a bound, an algorithm, a proof) is
  **cited on its merits**, regardless of who funded it. No customer
  case study, no NDA problem, no industry-specific defence required.
- The **byline carries the recognition**, not the company name. The
  founder authors; Riviera Engineering is the institutional
  affiliation. The PDF stays on arXiv / OpenReview / journal pages for
  years; the affiliation sits in the metadata.
- These problems are publishable from a **small independent setup** —
  a workstation, public datasets, theoretical analysis — without
  needing lab access, hardware, or industry partnerships. The barrier
  is intellectual, not logistical.

The 10 problems below are ordered from **most concrete / most directly
publishable** to **most theoretical / longest payoff**.

For each: a one-line thesis, the gap in the literature that makes it
publishable, a method sketch, suggested venues, an outline, an effort
estimate, and how the byline ties back to Riviera Engineering.

---

## 1. Multi-Scale Error Detection with Bounded Inference Cost

**Thesis.** A detection method exists that, given a fixed FLOP budget,
matches or exceeds the accuracy of current detectors across the full
range of defect scales in industrial images — without per-scale
hyperparameter tuning.

**The abstract problem.** Detecting rare or small targets in large
images is structurally harder than classification: the receptive field
needed to recognise a target is larger than the area the target
occupies. Current detectors either (a) lose small targets because they
downsample too aggressively, (b) explode in compute because they run
multi-scale feature pyramids, or (c) require per-dataset scale-tuning.
The general question: **what is the optimal allocation of compute over
spatial scales for detection, expressed as a closed-form policy?**

**Method sketch.** Cast scale allocation as a constrained allocation
problem: minimise expected detection loss subject to a total-FLOP
budget, with the loss being a function of receptive field coverage per
scale. The closed-form policy is a piecewise allocation across log-scale
bins. Train a small predictor that maps image statistics → optimal
allocation. Compare to FPN, BiFPN, NAS-FPN on standard detection
benchmarks (COCO, VisDrone, MVTec AD for industrial).

**Venues.**
- *CVPR / ICCV / ECCV* — main track detection papers
- *IEEE Transactions on Pattern Analysis and Machine Intelligence (TPAMI)*
- *International Journal of Computer Vision (IJCV)*
- *WACV* — slightly easier acceptance, still respected
- *BMVC* — solid European venue, good fit for a Munich-based author

**Outline.**
1. The scale-coverage trade-off formalised as an allocation problem
2. Closed-form optimal allocation under FLOP budget
3. Learned predictor for image-dependent allocation
4. Benchmarks: COCO + VisDrone + MVTec AD
5. Comparison table against FPN / BiFPN / NAS-FPN
6. When the method loses, and why
7. Reproducibility appendix: code, configs, all seeds

**Effort.** ~4 months of compute + experiments + 4 weeks of writing.
Achievable as a single-author paper.

**Tie-back.** The byline is the first publication crediting Riviera
Engineering with a detection result; the affiliation URL stays on the
PDF. Cited in any follow-up work on industrial inspection.

---

## 2. Sample-Efficient Anomaly Detection Without Synthetic Data

**Thesis.** A method that achieves >0.95 AUROC on standard anomaly
detection benchmarks with **only the normal-class training samples**
(no synthetic defects, no external data), and that provably approaches
the optimal Bayes detector as the number of normal samples grows.

**The abstract problem.** Anomaly detection is the canonical
unsupervised problem: learn what "normal" looks like, flag deviations.
The state of the art (PatchCore, EfficientAD, SimpleNet) works but
each method has a different failure mode and no theoretical guarantee
of approaching optimality. The general question: **what is the
asymptotic behaviour of the learned normality score, and can a method
be designed whose regret against the optimal detector is bounded?**

**Method sketch.** Frame anomaly detection as density-ratio
estimation: p(x)/q(x) where q is a uniform or reference distribution.
Use a learned normalising flow for p(x); use a closed-form reference
for q. Bound the density-ratio error in terms of flow capacity and
sample size. Show that the resulting AUROC has a known asymptotic
form. Compare empirically.

**Venues.**
- *NeurIPS / ICML / ICLR* — theoretical + empirical
- *JMLR* — if reformulated as a theory paper
- *TPAMI* — if empirical results dominate

**Outline.**
1. Anomaly detection as density-ratio estimation
2. Reference distribution choice and its effect on AUROC
3. Asymptotic bound on detection regret
4. Practical algorithm
5. Benchmarks: MVTec AD, VisA, BTAD
6. Comparison to PatchCore / EfficientAD / SimpleNet
7. Where the bound is loose

**Effort.** ~3 months. Theory + experiments fit a single-author paper.

**Tie-back.** Establishes Riviera Engineering as an anomaly-detection
research group, not just a vendor using other people's methods.

---

## 3. The Synthetic-to-Real Gap as a Tractable Optimisation Problem

**Thesis.** The synthetic-to-real domain gap in industrial vision can
be **upper-bounded** by a measurable quantity (the divergence between
synthetic and real feature distributions), and that bound is tight
enough to be useful for *selecting which augmentation to apply*.

**The abstract problem.** Domain adaptation methods abound; principled
*predictions* of how wide the gap is and how to close it do not. The
general question: **given two distributions over image features, how
wide is the gap, and which intervention (augmentation, fine-tuning,
re-pretraining) closes it fastest?**

**Method sketch.** Train a feature extractor on synthetic data only.
Measure the feature distribution shift against a small real-data
validation set using MMD or sliced Wasserstein. Show that the
divergence correlates with downstream detection accuracy across a
family of interventions. Derive a policy that picks the intervention
minimising divergence per unit of compute. Validate across synthetic /
real splits of MVTec and industrial datasets.

**Venues.**
- *CVPR / ECCV (domain adaptation tracks)*
- *ICML (Distribution shift workshop)*
- *TPAMI*

**Outline.**
1. Formalising the synthetic-to-real gap
2. Estimator choice: MMD vs sliced Wasserstein vs others
3. Empirical correlation across intervention types
4. The intervention-selection policy
5. Results on MVTec-AD, VisA, and a custom synthetic/real split
6. Limits: where the bound fails
7. Reproducibility

**Effort.** ~5 months. Doable but longer.

**Tie-back.** Positions the company as having *theoretical* domain
adaptation expertise — a much stronger credential than "we tried
fine-tuning and it worked".

---

## 4. A Tight Generalisation Bound for k-Shot Fine-Tuning

**Thesis.** For a pretrained backbone and a downstream task with k
examples per class, the generalisation gap is bounded by a function of
k, the intrinsic dimension of the downstream task, and the alignment
between pretrain and downstream objectives — and the bound is tighter
than current Rademacher-style bounds by a factor that depends on
alignment.

**The abstract problem.** Few-shot fine-tuning works. Theory doesn't
predict *how well* it works. Existing bounds are vacuous at small k.
The general question: **what is the tightest generalisation bound for
k-shot fine-tuning as a function of pretrain-downstream alignment?**

**Method sketch.** Define "alignment" as the principal angle between
the pretrain feature space and the downstream task subspace. Show that
fine-tuning error decomposes into a backbone-error term, a sample-error
term, and an alignment-error term. Prove an upper bound. Validate
empirically on Meta-Dataset, VTAB, and standard few-shot benchmarks.

**Venues.**
- *COLT / NeurIPS (theory track) / JMLR*
- *ICLR*

**Outline.**
1. Setup and definitions
2. Alignment as a measurable quantity
3. Main bound
4. Tightness analysis (lower bound construction)
5. Empirical validation
6. Practical implication: when to fine-tune, when to use linear probing

**Effort.** ~6 months if theory-first; ~3 months if empirical-first.

**Tie-back.** Theory paper establishes the founder as a *theorist*,
not just a practitioner. Long-term Scholar moat.

---

## 5. Calibrated Uncertainty Without Knowing the Test Imbalance

**Thesis.** A calibration method exists that produces well-calibrated
probabilities under arbitrary class imbalance, **without requiring the
practitioner to specify the imbalance ratio**.

**The abstract problem.** Calibration methods (temperature scaling,
Platt scaling, ensemble-based methods) assume the test class
distribution matches calibration-set distribution. In practice it
doesn't, and the imbalance is unknown. The general question:
**what's the right calibration method when test-time class frequencies
are unknown and may drift?**

**Method sketch.** Treat calibration as a meta-prediction problem: a
small meta-network takes a batch of (prediction, label) pairs and
predicts the calibration parameters as a function of the empirical
class frequencies *within the calibration batch itself*. Prove that
the meta-prediction converges to the correct calibration parameters as
batch size grows. Validate on long-tailed classification benchmarks.

**Venues.**
- *NeurIPS / ICML / ICLR*
- *TPAMI*
- *AISTATS*

**Outline.**
1. The unknown-imbalance calibration problem formalised
2. Meta-network architecture and training procedure
3. Convergence analysis
4. Benchmarks: ImageNet-LT, Places-LT, iNaturalist
5. Comparison to temperature scaling, ensembles, label shift
   correction
6. Where it fails

**Effort.** ~5 months.

**Tie-back.** Generalises beyond inspection into any deployed ML
system; increases the paper's citation radius.

---

## 6. Information-Theoretic Analysis of Learned Augmentation Policies

**Thesis.** The success of learned augmentation policies (AutoAugment,
RandAugment, TrivialAugment) can be explained by an information-
theoretic quantity — the mutual information between the augmentation
and the invariant task subspace — and a policy that directly maximises
that quantity outperforms existing learned policies at fixed compute.

**The abstract problem.** Augmentation works. We don't know *which*
augmentations work and *why*. AutoAugment searched 10¹⁵ candidates and
found good ones; we have no principled account of why. The general
question: **what is the right objective for augmentation learning?**

**Method sketch.** Define the augmentation-invariant subspace as the
subspace of features that are invariant to the augmentation family.
Show that maximising mutual information between augmentations and
task labels *projected onto this subspace* is a tighter objective
than existing alternatives. Derive a differentiable estimator.
Compare to RandAugment, TrivialAugment, AutoAugment.

**Venues.**
- *ICLR / NeurIPS / ICML*
- *TPAMI*

**Outline.**
1. The augmentation-invariant subspace formalised
2. Information-theoretic objective
3. Differentiable estimator
4. The new policy
5. Empirical comparison
6. Where the theory is loose

**Effort.** ~4 months.

**Tie-back.** Augmentation is fundamental to every deployed CV system;
a method that improves it has wide applicability.

---

## 7. Adversarial Robustness of Detection vs Classification

**Thesis.** Object detectors have **distinct** adversarial vulnerability
patterns from classifiers, and a robustness bound derived specifically
for detection (rather than borrowed from classification) is provably
tighter.

**The abstract problem.** Adversarial robustness theory is dominated by
classification results. Detection has a different output structure
(bounding boxes, per-box class scores), and the appropriate robustness
notion is different. The general question: **what is the right
adversarial robustness bound for detection, and how does it differ
from classification?**

**Method sketch.** Define detection robustness as the worst-case
perturbation that changes either the class or the IoU of any detected
box by more than ε. Show that bounding-box regression creates a
different vulnerability profile than classification. Derive a
detector-specific robustness bound. Compare empirically using
gradient-based attacks adapted to detection outputs.

**Venues.**
- *NeurIPS / ICLR (security / robustness workshops and main track)*
- *IEEE Transactions on Information Forensics and Security*
- *CVPR (adversarial vision workshop)*

**Outline.**
1. Detection-specific threat model
2. Difference from classification
3. Detector-specific bound
4. Attack design
5. Empirical comparison to PGD adapted from classification
6. Defence strategies
7. Limits

**Effort.** ~6 months.

**Tie-back.** Industrial inspection *needs* robustness guarantees;
this paper provides theoretical grounding for a property the company
already has to claim.

---

## 8. Convergence Rates for Non-Convex Optimisation Under Physical Constraints

**Thesis.** When a loss function includes terms derived from physical
laws (mass conservation, energy bounds, kinematic limits), the
optimisation landscape is non-convex in a specific, structured way,
and a projected-gradient method with a constraint-aware step size
converges at a provably faster rate than vanilla projected gradient.

**The abstract problem.** Many engineering losses combine data-fit
terms with physics-derived terms. The combined loss is non-convex and
constrained. Generic projected-gradient methods converge slowly
because the constraint set is high-dimensional and structured. The
general question: **for a non-convex loss with structured constraints,
what's the fastest known convergence rate, and is it achievable by a
practical algorithm?**

**Method sketch.** Assume the constraints define a manifold; the loss
restricted to the manifold is non-convex but with bounded curvature.
Show that manifold-aware gradient descent achieves a rate of
O(1/sqrt(T)) on the primal objective and O(1/T) on the dual. Compare
empirically on a benchmark suite of physics-constrained losses (robot
inverse dynamics, structural design, optical design).

**Venues.**
- *NeurIPS / ICML (optimisation track)*
- *Mathematical Programming*
- *SIAM Journal on Optimisation*

**Outline.**
1. The structured-constraint optimisation problem
2. Manifold-aware projected gradient
3. Convergence proof
4. Empirical benchmark suite
5. Comparison to vanilla methods
6. Application illustrations

**Effort.** ~6–8 months if theory + experiments; theory-only is
shorter.

**Tie-back.** Bridges theory and physical engineering — exactly the
positioning the company wants to occupy.

---

## 9. Combinatorial Optimal Transport for Structured Prediction

**Thesis.** A variant of optimal transport that exploits the
combinatorial structure of the output space (segmentation masks,
keypoint sets, parse trees) achieves the same transport cost in
**O(n log n)** instead of **O(n³)**, with no loss in solution quality.

**The abstract problem.** Optimal transport is the loss of choice for
structured prediction, but standard Sinkhorn is cubic in the number
of points. Structured outputs have structure (label graph, region
adjacency, keypoint topology) that the OT solver ignores. The
general question: **can the structure of the output space be
exploited to reduce OT complexity from O(n³) to O(n log n)?**

**Method sketch.** For output spaces with a known graph structure,
show that the OT plan factorises over the graph's cliques, reducing
the per-iteration cost. Combine with a hierarchical coarsening of the
transport plan. Prove complexity bound. Validate on semantic
segmentation, human pose, dependency parsing.

**Venues.**
- *ICML / NeurIPS / ICLR*
- *TPAMI*
- *EMNLP* (if the application is parsing)

**Outline.**
1. Structured-output optimal transport problem
2. Clique factorisation
3. Coarsening scheme
4. Complexity analysis
5. Empirical comparison to Sinkhorn on structured tasks
6. Where the structure assumption fails

**Effort.** ~6 months.

**Tie-back.** Highly cited general-ML paper; broad applicability.

---

## 10. Learnable Equivariance for Industrial Vision

**Thesis.** A network architecture that **learns** which symmetries
(rotation, translation, illumination, scale) to respect — rather than
hard-coding them — matches the accuracy of fully equivariant
architectures on industrial inspection tasks while generalising to
symmetries not present in the training distribution.

**The abstract problem.** Equivariant networks (E(2)-CNNs, group
equivariant networks) hard-code symmetries, requiring expert
knowledge of the right symmetry group per task. Some symmetries are
unknown or partially present. The general question: **can a network
learn which symmetries to respect, with generalisation guarantees to
unseen symmetries?**

**Method sketch.** Use a soft-equivariance layer: a group-convolution
whose mixing weights over group elements are learned and regularised
toward sparsity. Show that the learned mixing weights identify the
"true" symmetry group when one exists, and degrade gracefully when
it doesn't. Prove generalisation bounds on unseen symmetries.
Validate on rotated MNIST, industrial inspection with rotation
invariance, molecular property prediction.

**Venues.**
- *NeurIPS / ICML / ICLR*
- *TPAMI*
- *ICLR (equivariance / geometric deep learning workshops)*

**Outline.**
1. The learnable-equivariance problem
2. Soft-equivariance layer
3. Regularisation and its effect on identified symmetries
4. Generalisation analysis
5. Empirical benchmarks
6. Comparison to hard-coded equivariance
7. Failure modes

**Effort.** ~6 months.

**Tie-back.** Connects theoretical ML (equivariance learning) to the
company's physical-engineering domain — a strong positioning move.

---

## Where to start

**Quickest theoretical win.** **#2 — Sample-efficient anomaly
detection.** Clean problem, public datasets, existing baselines to
beat, single-author feasible, fits NeurIPS / ICML.

**Highest impact-per-effort.** **#1 — Multi-scale detection with
bounded compute.** Direct industrial relevance, clean theory,
top-tier venues.

**Highest long-term Scholar moat.** **#4 — Few-shot fine-tuning
bound** or **#8 — Constrained non-convex optimisation rates**.
Theory papers are cited for decades.

**Best positioning move.** **#3 — Synthetic-to-real gap.** Bridges
the company's industrial domain with mainstream CV research; citable
in both communities.

---

## How this builds recognition

These are *abstract* problems: each can be solved without a customer,
a deployment, or a specific industry context. The deliverable is a
method + proof + benchmark result.

The recognition strategy:
1. **The founder authors; Riviera Engineering is the affiliation.**
2. The paper goes to arXiv on submission day (immediate permanence).
3. After peer review, it appears in a journal/proceedings with the
   affiliation in the metadata.
4. Other researchers cite the byline and the affiliation. The
   affiliation URL is in the PDF, where Google indexes it.
5. The cumulative citation count is the company's research
   reputation — measurable, durable, free.

Ads amplify a brand; **publications build one**. This list is the
research agenda that builds it.